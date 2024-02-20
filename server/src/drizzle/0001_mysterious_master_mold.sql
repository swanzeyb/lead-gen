CREATE TABLE `facebook:index` (
	`url` text,
	`fbID` text,
	`price` text,
	`title` text,
	`location` text,
	`miles` text,
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer,
	`status` text,
	`error` text
);
