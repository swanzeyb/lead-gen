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
	`first_price` text,
	`last_price` text,
	`first_seen` integer,
	`last_seen` integer,
	`title` text,
	`location` text,
	`miles` text,
	`id` text PRIMARY KEY NOT NULL,
	`status` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `facebook:index_fbID_unique` ON `facebook:index` (`fbID`);