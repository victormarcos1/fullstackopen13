\d
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author text,
  url text NOT NULL,
  title text NOT NULL,
  likes INTEGER DEFAULT 0
);
insert into blogs (author, url, title, likes) values ('Kiisu', 'kiisu.fi', 'Kissat maukuu paljon', 5);
insert into blogs (author, url, title, likes) values ('Miuku', 'miuku.fi', 'Kissat koiria parempia', 9001);
insert into blogs (author, url, title, likes) values ('Dan Abramov', 'test.fi', 'Writing Resilient Components', 0);
insert into blogs (author, url, title, likes) values ('Martin Fowler', 'test.fi', 'Is High Quality Software Worth the Cost?', 0);
insert into blogs (author, url, title, likes) values ('Robert C. Martin', 'test.fi', 'FP vs. OO List Processing', 0);
select * from blogs;
\d blogs;