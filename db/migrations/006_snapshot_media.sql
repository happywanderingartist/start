SET LOCAL ROLE start_catalog_owner;
SET LOCAL search_path=start_catalog,pg_catalog;
CREATE OR REPLACE FUNCTION snapshot_public(key uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,start_catalog AS $$
 SELECT v.snapshot||jsonb_build_object(
 'hero',CASE WHEN media_json(v.hero_media_id) IS NOT NULL THEN v.snapshot->'hero' ELSE NULL END,
 'claims',refresh_claims(v.snapshot->'claims'),'sources',refresh_sources(v.snapshot->'sources'),
 'stops',(SELECT jsonb_agg(x.value||jsonb_build_object('relation',refresh_relation(x.value->'relation'),'claims',refresh_claims(x.value->'claims'),'sources',refresh_sources(x.value->'sources')) ORDER BY x.ordinality) FROM jsonb_array_elements(v.snapshot->'stops') WITH ORDINALITY x)) FROM route_revision v WHERE v.id=key
$$;
RESET ROLE;
