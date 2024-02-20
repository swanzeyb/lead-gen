CREATE TABLE `dom:facebook` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text,
	`timestamp` integer,
	`html` blob
);
--> statement-breakpoint
CREATE TABLE `facebook:index` (
	`url` text,
	`fbID` text,
	`price` text,
	`title` text,
	`location` text,
	`miles` text,
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer,
	`status` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `facebook:index_fbID_unique` ON `facebook:index` (`fbID`);