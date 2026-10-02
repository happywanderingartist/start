SET LOCAL ROLE start_catalog_owner;
SET LOCAL search_path=pg_catalog,start_catalog,pg_temp;
-- pg_temp is implicitly searched first for relations unless explicitly ordered.
-- Keep even reader-created temporary shadows behind the trusted canonical schema.
DO $$ DECLARE fn regprocedure; BEGIN
 FOR fn IN SELECT p.oid::regprocedure FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='start_catalog' LOOP
  EXECUTE format('ALTER FUNCTION %s SET search_path = pg_catalog, start_catalog, pg_temp',fn);
 END LOOP;
END $$;
RESET ROLE;
