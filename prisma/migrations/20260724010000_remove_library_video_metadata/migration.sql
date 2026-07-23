-- Library videos retain only YouTube IDs. Display metadata is fetched live
-- from YouTube when a collection is viewed.
ALTER TABLE "LibraryVideo"
  DROP COLUMN "channel",
  DROP COLUMN "thumbnail",
  DROP COLUMN "title";
