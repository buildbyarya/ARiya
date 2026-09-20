DO $$
BEGIN
  CREATE TYPE "LibraryVideoType" AS ENUM ('WATCH_LATER', 'LIKED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "LibraryVideo"
  ALTER COLUMN "type" TYPE "LibraryVideoType"
  USING CASE UPPER("type"::text)
    WHEN 'WATCH_LATER' THEN 'WATCH_LATER'::"LibraryVideoType"
    WHEN 'LIKED' THEN 'LIKED'::"LibraryVideoType"
    ELSE NULL
  END;
