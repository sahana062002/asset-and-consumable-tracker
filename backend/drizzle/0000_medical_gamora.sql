CREATE TABLE `asset_movements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`asset_id` bigint unsigned NOT NULL,
	`from_location_id` bigint unsigned,
	`to_location_id` bigint unsigned NOT NULL,
	`moved_by` bigint unsigned NOT NULL,
	`notes` text,
	`moved_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `asset_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asset_usages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`asset_id` bigint unsigned NOT NULL,
	`quantity_used` int NOT NULL,
	`quantity_before` int NOT NULL,
	`quantity_after` int NOT NULL,
	`updated_by` bigint unsigned NOT NULL,
	`notes` text,
	`used_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `asset_usages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`asset_code` varchar(100) NOT NULL,
	`type` enum('fixed','consumable') NOT NULL,
	`status` enum('active','disposed') NOT NULL DEFAULT 'active',
	`quantity` int,
	`initial_quantity` int,
	`location_id` bigint unsigned NOT NULL,
	`created_by` bigint unsigned,
	`disposal_photo_url` varchar(500),
	`disposed_at` timestamp,
	`disposed_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `assets_asset_code_unique` UNIQUE(`asset_code`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`level` enum('campus','building','floor','room','shelf') NOT NULL,
	`parent_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('admin','user') NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `asset_movements` ADD CONSTRAINT `asset_movements_asset_id_assets_id_fk` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `asset_movements` ADD CONSTRAINT `asset_movements_from_location_id_locations_id_fk` FOREIGN KEY (`from_location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `asset_movements` ADD CONSTRAINT `asset_movements_to_location_id_locations_id_fk` FOREIGN KEY (`to_location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `asset_movements` ADD CONSTRAINT `asset_movements_moved_by_users_id_fk` FOREIGN KEY (`moved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `asset_usages` ADD CONSTRAINT `asset_usages_asset_id_assets_id_fk` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `asset_usages` ADD CONSTRAINT `asset_usages_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assets` ADD CONSTRAINT `assets_disposed_by_users_id_fk` FOREIGN KEY (`disposed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `locations` ADD CONSTRAINT `locations_parent_id_locations_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;