CREATE TABLE sandboxes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE sandbox_tools (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id  UUID NOT NULL REFERENCES sandboxes(id) ON DELETE CASCADE,
    tool_type   VARCHAR(100) NOT NULL,
    data        TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE side_hustles (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id         UUID REFERENCES sandboxes(id) ON DELETE SET NULL,
    student_id         UUID NOT NULL,
    title              VARCHAR(255) NOT NULL,
    description        TEXT,
    status             VARCHAR(20) NOT NULL DEFAULT 'IN_THE_LAB',
    has_open_positions BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE bmc_sections (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    side_hustle_id         UUID NOT NULL UNIQUE REFERENCES side_hustles(id) ON DELETE CASCADE,
    key_partners           TEXT,
    key_activities         TEXT,
    key_resources          TEXT,
    value_propositions     TEXT,
    customer_relationships TEXT,
    channels               TEXT,
    customer_segments      TEXT,
    cost_structure         TEXT,
    revenue_streams        TEXT
);

CREATE TABLE teams (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    side_hustle_id UUID NOT NULL UNIQUE REFERENCES side_hustles(id) ON DELETE CASCADE,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE team_members (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    role       VARCHAR(100),
    joined_at  TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (team_id, student_id)
);

CREATE TABLE positions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    side_hustle_id UUID NOT NULL REFERENCES side_hustles(id) ON DELETE CASCADE,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    status         VARCHAR(20) NOT NULL DEFAULT 'OPEN'
);
