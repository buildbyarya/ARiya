-- Store enough YouTube metadata to render a saved video without another API lookup.
ALTER TABLE "LibraryVideo"
  ADD COLUMN "title" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "thumbnail" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "channel" TEXT NOT NULL DEFAULT '';

-- Existing records were created by the Watch Later route, so they belong to
-- the corresponding protected collection before the column becomes an enum.
UPDATE "LibraryVideo"
SET "type" = 'WATCH_LATER'
WHERE "type" NOT IN ('WATCH_LATER', 'LIKED');

CREATE TYPE "LibraryVideoType" AS ENUM ('WATCH_LATER', 'LIKED');

ALTER TABLE "LibraryVideo"
  ALTER COLUMN "type" TYPE "LibraryVideoType"
  USING "type"::"LibraryVideoType";

ALTER TABLE "LibraryVideo"
  ALTER COLUMN "title" DROP DEFAULT,
  ALTER COLUMN "thumbnail" DROP DEFAULT,
  ALTER COLUMN "channel" DROP DEFAULT;
