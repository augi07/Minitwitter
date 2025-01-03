const USER_TABLE = `
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('Admin', 'anchorman', 'user') DEFAULT 'user',
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);
`;

const TWEET_TABLE = `
CREATE TABLE IF NOT EXISTS tweets (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    content VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

export { USER_TABLE, TWEET_TABLE };
