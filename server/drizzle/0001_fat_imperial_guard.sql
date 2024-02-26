CREATE TABLE `dom:manheim` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer,
	`html` blob
);
--> statement-breakpoint
CREATE TABLE `manheim:values` (
	`id` text PRIMARY KEY NOT NULL,
	`low` integer,
	`average` integer,
	`high` integer,
	`adjusted` integer,
	`timestamp` integer
);
