SET LOCAL ROLE start_catalog_owner;
SET LOCAL search_path=start_catalog,pg_catalog;
CREATE TABLE evidence_source(id uuid PRIMARY KEY,source_type text NOT NULL,url text CHECK(url IS NULL OR url ~ '^https?://[^[:space:]]+$'),public_title text NOT NULL,public_excerpt text,observed_at timestamptz NOT NULL,review review_state NOT NULL DEFAULT 'draft',visibility visibility_state NOT NULL DEFAULT 'private',availability text NOT NULL DEFAULT 'unknown' CHECK(availability IN ('available','unavailable','unknown')),last_checked_at timestamptz,reviewer text,reviewed_at timestamptz,review_reason text);
CREATE TABLE media_asset(id uuid PRIMARY KEY,object_key text NOT NULL,mime text NOT NULL,width integer NOT NULL CHECK(width>0),height integer NOT NULL CHECK(height>0),rights_state text NOT NULL CHECK(rights_state IN ('approved','unknown','revoked','infringing')),visibility visibility_state NOT NULL DEFAULT 'private',source_evidence_id uuid REFERENCES evidence_source);
ALTER TABLE artist ADD FOREIGN KEY(primary_media_id) REFERENCES media_asset;
ALTER TABLE place ADD FOREIGN KEY(media_id) REFERENCES media_asset;
ALTER TABLE route_revision ADD FOREIGN KEY(hero_media_id) REFERENCES media_asset;
CREATE TABLE claim(id uuid PRIMARY KEY,statement text NOT NULL CHECK(length(statement)>0),verification verification_state NOT NULL DEFAULT 'unverified',verified_at timestamptz,review review_state NOT NULL DEFAULT 'draft',visibility visibility_state NOT NULL DEFAULT 'private',public_caveat text,severe_dispute boolean NOT NULL DEFAULT false,is_core boolean NOT NULL DEFAULT false,relation_id uuid REFERENCES artist_place_relation,revision_id uuid REFERENCES route_revision,stop_id uuid REFERENCES route_stop,place_id uuid REFERENCES place,event_id uuid,reviewer text,reviewed_at timestamptz,review_reason text,CHECK(num_nonnulls(relation_id,revision_id,stop_id,place_id,event_id)=1));
CREATE TABLE claim_evidence(claim_id uuid NOT NULL REFERENCES claim,evidence_source_id uuid NOT NULL REFERENCES evidence_source,support_role text NOT NULL CHECK(support_role IN ('supports','context','contradicts')),PRIMARY KEY(claim_id,evidence_source_id));
CREATE TABLE relation_evidence(relation_id uuid NOT NULL REFERENCES artist_place_relation,evidence_source_id uuid NOT NULL REFERENCES evidence_source,PRIMARY KEY(relation_id,evidence_source_id));
CREATE TABLE revision_evidence(revision_id uuid NOT NULL REFERENCES route_revision,evidence_source_id uuid NOT NULL REFERENCES evidence_source,PRIMARY KEY(revision_id,evidence_source_id));
CREATE TABLE stop_evidence(stop_id uuid NOT NULL REFERENCES route_stop,evidence_source_id uuid NOT NULL REFERENCES evidence_source,PRIMARY KEY(stop_id,evidence_source_id));
CREATE TABLE place_evidence(place_id uuid NOT NULL REFERENCES place,evidence_source_id uuid NOT NULL REFERENCES evidence_source,PRIMARY KEY(place_id,evidence_source_id));
CREATE TABLE import_record(source_key text PRIMARY KEY,sha256 text NOT NULL,imported_at timestamptz NOT NULL DEFAULT now(),provenance jsonb NOT NULL);
CREATE TABLE review_record(id uuid PRIMARY KEY,subject_revision_id uuid REFERENCES route_revision,subject_claim_id uuid REFERENCES claim,subject_relation_id uuid REFERENCES artist_place_relation,reviewer text NOT NULL,reviewed_at timestamptz NOT NULL,decision review_state NOT NULL,reason text NOT NULL,evidence_ids uuid[] NOT NULL,CHECK(num_nonnulls(subject_revision_id,subject_claim_id,subject_relation_id)=1));
CREATE FUNCTION immutable_review() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN RAISE EXCEPTION 'review records append-only'; END $$;
CREATE TRIGGER review_no_rewrite BEFORE UPDATE OR DELETE ON review_record FOR EACH ROW EXECUTE FUNCTION immutable_review();
CREATE FUNCTION frozen_revision() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN IF OLD.frozen_at IS NOT NULL THEN RAISE EXCEPTION 'frozen revision immutable'; END IF; IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END $$;
CREATE TRIGGER revision_no_rewrite BEFORE UPDATE OR DELETE ON route_revision FOR EACH ROW EXECUTE FUNCTION frozen_revision();
CREATE FUNCTION frozen_stop() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,start_catalog AS $$ BEGIN
 IF TG_OP <> 'INSERT' AND EXISTS(SELECT FROM route_revision WHERE id=OLD.revision_id AND frozen_at IS NOT NULL) THEN RAISE EXCEPTION 'frozen stop immutable'; END IF;
 IF TG_OP <> 'DELETE' AND EXISTS(SELECT FROM route_revision WHERE id=NEW.revision_id AND frozen_at IS NOT NULL) THEN RAISE EXCEPTION 'frozen stop immutable'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END $$;
CREATE TRIGGER stop_no_rewrite BEFORE INSERT OR UPDATE OR DELETE ON route_stop FOR EACH ROW EXECUTE FUNCTION frozen_stop();
CREATE FUNCTION revision_owner_lock() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,start_catalog AS $$ BEGIN
 IF OLD.published_revision_id IS NOT NULL AND (NEW.city_id IS DISTINCT FROM OLD.city_id OR NEW.linked_artist_id IS DISTINCT FROM OLD.linked_artist_id OR NEW.slug IS DISTINCT FROM OLD.slug) THEN RAISE EXCEPTION 'published route identity immutable'; END IF; RETURN NEW; END $$;
CREATE TRIGGER route_identity_lock BEFORE UPDATE ON route FOR EACH ROW EXECUTE FUNCTION revision_owner_lock();
RESET ROLE;
