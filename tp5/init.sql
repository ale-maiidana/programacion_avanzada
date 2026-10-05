CREATE TABLE IF NOT EXISTS tasks (
  id            SERIAL PRIMARY KEY,
  project_name  VARCHAR(100) NOT NULL,
  activity_type VARCHAR(30)  NOT NULL,
  status        VARCHAR(30)  NOT NULL DEFAULT 'Por hacer',
  summary       VARCHAR(200) NOT NULL,
  description   TEXT,
  priority      VARCHAR(20)  NOT NULL DEFAULT 'Media',
  reporter      VARCHAR(100) NOT NULL,
  assignee      VARCHAR(100),
  precondition  TEXT,
  created_at    TIMESTAMP    NOT NULL DEFAULT now(),
  closed_at     TIMESTAMP,
  sprint        VARCHAR(50)
);
