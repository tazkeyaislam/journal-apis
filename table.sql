CREATE TABLE app_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(250),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(250),
    status ENUM('active', 'inactive') NOT NULL,
    role ENUM('admin', 'user') NOT NULL
);

INSERT INTO app_user (name, email, password, status, role) 
VALUES ('Admin', 'admin@gmail.com', 'admin', 'active', 'admin');

CREATE TABLE category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE article (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    category_id INT NOT NULL,
    publication_date DATE,
    status ENUM('draft', 'published') NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

CREATE TABLE article_like (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    like_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id),
    FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

CREATE TABLE comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text LONGTEXT NOT NULL,
    comment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);
