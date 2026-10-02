SET LOCAL ROLE start_catalog_owner;
SET LOCAL search_path=start_catalog,pg_catalog;
-- Append-only correction: SQL CHECK treats UNKNOWN as success, so require non-null metadata explicitly.
ALTER TABLE place ADD CONSTRAINT place_complete_coordinates CHECK (
 (longitude IS NULL AND latitude IS NULL AND coordinate_system IS NULL) OR
 (longitude IS NOT NULL AND latitude IS NOT NULL AND coordinate_system IS NOT NULL AND longitude BETWEEN -180 AND 180 AND latitude BETWEEN -90 AND 90 AND coordinate_system IN ('gcj02','wgs84','bd09')));
-- Row locks serialize stop editing with freezing. The check runs after obtaining parent locks.
CREATE OR REPLACE FUNCTION frozen_stop() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,start_catalog AS $$
DECLARE target_ids uuid[];
BEGIN
 IF TG_OP='INSERT' THEN target_ids=ARRAY[NEW.revision_id];
 ELSIF TG_OP='DELETE' THEN target_ids=ARRAY[OLD.revision_id];
 ELSE target_ids=ARRAY[OLD.revision_id,NEW.revision_id]; END IF;
 PERFORM id FROM route_revision WHERE id=ANY(target_ids) ORDER BY id FOR UPDATE;
 IF EXISTS(SELECT FROM route_revision WHERE id=ANY(target_ids) AND frozen_at IS NOT NULL) THEN RAISE EXCEPTION 'frozen stop immutable'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF EXISTS(SELECT FROM pg_roles WHERE rolname IN ('start_catalog_owner','start_public_reader') AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)) OR
 EXISTS(SELECT FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname IN ('start_catalog_owner','start_public_reader')) THEN
  RAISE EXCEPTION 'START roles must be dedicated unprivileged roles without inherited memberships';
 END IF;
END $$;
