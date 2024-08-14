create table appuser(
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    email varchar(50),
    password varchar(250),
    status varchar(20),
    isDeletable varchar(20),
    UNIQUE (email),
    role VARCHAR(20),
);

insert into appuser (name, email, password, status, isDeletable) values ('Admin','admin@gmail.com', 'admin', 'true', 'false','admin');

create table category(
    id int primary key AUTO_INCREMENT,
    name varchar(255) NOT NULL
);

create table article(
    id int primary key AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    content LONGTEXT NOT NULL,
    categoryId integer NOT NULL,
    publication_date DATE,
    status varchar(20),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES appuser(id)
);

CREATE TABLE article_like(
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    like_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id),
    FOREIGN KEY (article_id) REFERENCES article(id),
    FOREIGN KEY (user_id) REFERENCES appuser(id)
);

CREATE TABLE comment(
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text LONGTEXT NOT NULL,
    comment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES article(id),
    FOREIGN KEY (user_id) REFERENCES appuser(id)
);

CREATE TABLE notification(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES appuser(id)
);

