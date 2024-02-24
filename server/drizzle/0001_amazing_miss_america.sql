CREATE TABLE `facebook:catalog` (
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
CREATE TABLE `facebook:product` (
	`url` text,
	`fbID` text,
	`title` text,
	`year` integer,
	`make` text,
	`model` text,
	`doors` integer,
	`class` text,
	`price` integer,
	`location` text,
	`miles` integer,
	`transmission` text,
	`exteriorColor` text,
	`interiorColor` text,
	`fuel` text,
	`isCleanTitle` integer,
	`description` text,
	`sellerName` text,
	`sellerJoined` integer,
	`isSponsored` integer,
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DROP TABLE `facebook:index`;--> statement-breakpoint
CREATE UNIQUE INDEX `facebook:catalog_fbID_unique` ON `facebook:catalog` (`fbID`);--> statement-breakpoint
CREATE UNIQUE INDEX `facebook:product_fbID_unique` ON `facebook:product` (`fbID`);