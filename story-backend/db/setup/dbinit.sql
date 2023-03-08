-- NOTE: likely not safe to store user generated html in db in serve that html to others. maybe markdown?
DROP TABLE IF EXISTS steps;
DROP TABLE IF EXISTS stories;
DROP TABLE IF EXISTS images;

-- two connected tables:
--  "stories" contains metadata on all stored stories
--  "steps" contains the content of all story steps

CREATE TABLE IF NOT EXISTS stories (
  storyID integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  title VARCHAR(30),
  category VARCHAR(120),
  description TEXT,
  author TEXT,
  story_json TEXT,
  date_created timestamp not null default CURRENT_TIMESTAMP,
  date_published timestamp,
  highlight_index INT,
  count_views INT,
  reading_time INT,
  langcode VARCHAR(10),
  PRIMARY KEY(storyID)
);


CREATE TABLE IF NOT EXISTS steps (
  stepID integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  storyID INT,
  step_major INT,
  step_minor INT,
  html TEXT,

  PRIMARY KEY(stepID),
  CONSTRAINT storyID
  FOREIGN KEY(storyID)
  REFERENCES stories(storyID)
);


CREATE TABLE IF NOT EXISTS images (
  imageID integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  storyID INT,
  step_major INT,
  step_minor INT,
  hash TEXT,
  filetype varchar(40),
  PRIMARY KEY(imageID)
);

