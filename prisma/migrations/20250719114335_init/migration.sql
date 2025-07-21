-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(50) NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chargerequest` (
    `id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `charge_id` VARCHAR(20) NOT NULL,
    `api_client_id` VARCHAR(20) NOT NULL,
    `price` FLOAT NOT NULL,
    `status` VARCHAR(10) NOT NULL,
    `created_at` VARCHAR(25) NOT NULL,
    `updated_at` VARCHAR(25) NOT NULL,
    `response` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crons` (
    `id` INTEGER NOT NULL,
    `crontype` VARCHAR(50) NOT NULL,
    `isrunning` BOOLEAN NOT NULL DEFAULT false,
    `lastrun` DATETIME(0) NOT NULL,
    `info` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etsy_keys` (
    `id` INTEGER NOT NULL,
    `shop_id` VARCHAR(255) NOT NULL,
    `store_name` VARCHAR(500) NULL,
    `access_token` VARCHAR(500) NULL,
    `refresh_token` VARCHAR(500) NULL,
    `oauth_token` VARCHAR(255) NOT NULL,
    `oauth_token_secret` VARCHAR(255) NOT NULL,
    `apiversion` ENUM('v2', 'v3') NOT NULL DEFAULT 'v2',
    `valid` BOOLEAN NOT NULL DEFAULT true,
    `sectionsimported` BOOLEAN NOT NULL DEFAULT false,
    `lastdatafetched` DATETIME(0) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `soldout` BOOLEAN NOT NULL DEFAULT false,
    `expired` BOOLEAN NOT NULL DEFAULT false,
    `draft` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etsy_requests` (
    `id` INTEGER NOT NULL,
    `inprocess` BOOLEAN NOT NULL,
    `status` ENUM('pending', 'completed') NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etsy_section` (
    `id` INTEGER NOT NULL,
    `shop_section_id` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `etsy_user_id` VARCHAR(255) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `galleries` (
    `id` INTEGER UNSIGNED NOT NULL,
    `filename` VARCHAR(100) NULL,
    `size` INTEGER NULL,
    `task_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `galleries_task_id_foreign`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `legacy` BOOLEAN NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `shopifylocationid` VARCHAR(30) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission_role` (
    `permission_id` INTEGER UNSIGNED NOT NULL,
    `role_id` INTEGER UNSIGNED NOT NULL,

    INDEX `permission_role_role_id_foreign`(`role_id`),
    PRIMARY KEY (`permission_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `display_name` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `permissions_name_unique`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `processimports` (
    `id` INTEGER NOT NULL,
    `count` INTEGER NOT NULL,
    `inprocess` INTEGER NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `imgurl` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `variant_id` INTEGER NULL,

    PRIMARY KEY (`id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER NOT NULL,
    `etsy_product_id` VARCHAR(100) NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `asin` VARCHAR(30) NOT NULL,
    `barcode` VARCHAR(50) NOT NULL,
    `option1val` VARCHAR(100) NOT NULL,
    `option2val` VARCHAR(100) NOT NULL,
    `option3val` VARCHAR(100) NOT NULL,
    `price` DOUBLE NOT NULL,
    `saleprice` DOUBLE NOT NULL,
    `pd_condition` VARCHAR(50) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `imageurl` LONGTEXT NOT NULL,
    `weight` FLOAT NULL,
    `weight_unit` VARCHAR(10) NULL,
    `newflag` TINYINT NOT NULL,
    `quantityflag` TINYINT NOT NULL,
    `priceflag` TINYINT NOT NULL,
    `block` TINYINT NOT NULL,
    `duplicate` TINYINT NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('Already Exist', 'Ready to Import', 'Import in progress', 'Imported') NOT NULL DEFAULT 'Ready to Import',
    `shopifyproductid` VARCHAR(30) NOT NULL,
    `shopifyvariantid` VARCHAR(30) NOT NULL,
    `shopifyinventoryid` VARCHAR(30) NOT NULL,
    `shopifylocationid` VARCHAR(30) NOT NULL,
    `amazonofferlistingid` VARCHAR(100) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `product_id` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,
    `tags` VARCHAR(2000) NOT NULL,
    `attributes` VARCHAR(2000) NOT NULL,
    `section_id` VARCHAR(255) NOT NULL,
    `section_name` VARCHAR(255) NOT NULL,
    `category_path` VARCHAR(255) NOT NULL,
    `etsy_state` VARCHAR(500) NOT NULL,
    `brand` VARCHAR(100) NOT NULL,
    `product_type` VARCHAR(100) NOT NULL,
    `has_variation` INTEGER NULL DEFAULT 1,
    `option1name` VARCHAR(100) NOT NULL,
    `option2name` VARCHAR(100) NOT NULL,
    `option3name` VARCHAR(100) NOT NULL,
    `etsylistingid` VARCHAR(30) NOT NULL,
    `main_image` LONGTEXT NULL,
    `product_image_data` LONGTEXT NULL,
    `variation_image_mapping` LONGTEXT NULL,
    `shopifyproductid` VARCHAR(30) NOT NULL,
    `newflag` TINYINT NOT NULL,
    `quantityflag` TINYINT NOT NULL,
    `priceflag` TINYINT NOT NULL,
    `block` TINYINT NOT NULL,
    `duplicate` TINYINT NOT NULL,
    `status` ENUM('Already Exist', 'Ready to Import', 'Import in progress', 'Imported', 'error', 'reimport in progress') NOT NULL DEFAULT 'Ready to Import',
    `errdetails` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`product_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` INTEGER UNSIGNED NOT NULL,
    `profile_name` VARCHAR(255) NOT NULL,
    `shipping_template_id` VARCHAR(255) NOT NULL,
    `shop_section_id` VARCHAR(255) NULL,
    `return_policy_id` VARCHAR(255) NULL,
    `processing_min` INTEGER NULL,
    `processing_max` INTEGER NULL,
    `category_id` VARCHAR(255) NOT NULL,
    `taxonomy_id` VARCHAR(255) NOT NULL,
    `who_made` VARCHAR(255) NULL,
    `is_supply` VARCHAR(255) NULL,
    `when_made` VARCHAR(255) NULL,
    `should_auto_renew` VARCHAR(255) NULL,
    `is_customizable` VARCHAR(255) NULL,
    `materials` VARCHAR(255) NOT NULL,
    `recipient` VARCHAR(255) NULL,
    `occasion` VARCHAR(255) NULL,
    `item_dimensions_unit` VARCHAR(255) NULL,
    `non_taxable` VARCHAR(255) NULL,
    `variant_mapping` TEXT NOT NULL,
    `profile_all_any` VARCHAR(225) NULL DEFAULT 'all',
    `profile_condition` TEXT NOT NULL,
    `attributes` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_user` (
    `user_id` INTEGER UNSIGNED NOT NULL,
    `role_id` INTEGER UNSIGNED NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `display_name` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `route_permission` (
    `id` INTEGER UNSIGNED NOT NULL,
    `route` VARCHAR(255) NOT NULL,
    `permissions` VARCHAR(255) NULL,
    `roles` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `accountOwner` BOOLEAN NOT NULL DEFAULT false,
    `locale` VARCHAR(191) NULL,
    `collaborator` BOOLEAN NULL DEFAULT false,
    `emailVerified` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setting` (
    `id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `published` INTEGER NOT NULL,
    `tags` VARCHAR(60) NOT NULL,
    `inventory_sync` INTEGER NOT NULL,
    `price_sync` INTEGER NOT NULL,
    `outofstock_action` ENUM('unpublish', 'outofstock', 'delete') NOT NULL DEFAULT 'outofstock',
    `markupenabled` BOOLEAN NOT NULL,
    `markuptype` ENUM('FIXED', 'PERCEN') NOT NULL DEFAULT 'FIXED',
    `markupval` FLOAT NOT NULL,
    `markupvalfixed` FLOAT NOT NULL,
    `markupround` BOOLEAN NOT NULL,
    `shopifyorders` BOOLEAN NOT NULL DEFAULT false,
    `fulfilment_service` VARCHAR(50) NOT NULL DEFAULT 'manual',
    `inventory_policy` VARCHAR(50) NOT NULL DEFAULT 'shopify',
    `shopifylocationid` VARCHAR(30) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sh_product_variants` (
    `id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(500) NULL,
    `sku` VARCHAR(255) NULL,
    `image` VARCHAR(500) NULL,
    `barcode` VARCHAR(255) NULL,
    `etsyproductid` VARCHAR(255) NULL,
    `quantity` INTEGER NULL,
    `price` DOUBLE NULL,
    `compare_at_price` DOUBLE NULL,
    `shopify_variant_id` BIGINT NULL,
    `shopify_inventory_item_id` BIGINT NULL,
    `shopify_product_id` BIGINT NULL,
    `shopify_product_handle` VARCHAR(500) NULL,
    `shopify_variant_data` LONGTEXT NULL,
    `sh_product_id` BIGINT NULL,
    `user_id` BIGINT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sh_products` (
    `id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(500) NULL,
    `edit_title` TEXT NULL,
    `image` LONGTEXT NULL,
    `status` ENUM('Already Exist', 'Ready to Import', 'Import in progress', 'Imported', 'reimport in progress', 'error', 'Unlinked', 'linked') NULL DEFAULT 'Unlinked',
    `shopify_product_id` BIGINT NULL,
    `etsylistingid` VARCHAR(100) NULL,
    `shopify_product_handle` VARCHAR(500) NULL,
    `shopify_product_type` VARCHAR(255) NULL,
    `brand` VARCHAR(250) NULL,
    `shopify_product_data` LONGTEXT NULL,
    `error_no` LONGTEXT NULL,
    `dimensions` LONGTEXT NULL,
    `has_variation` INTEGER NOT NULL,
    `Source` LONGTEXT NULL,
    `submit` BOOLEAN NULL,
    `error_info` TEXT NULL,
    `profile_id` INTEGER NULL,
    `user_id` BIGINT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `block` INTEGER NOT NULL DEFAULT 0
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopifyorders` (
    `id` INTEGER NOT NULL,
    `orderid` VARCHAR(50) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `orderdata` TEXT NOT NULL,
    `inventoryupdates` VARCHAR(5000) NOT NULL,
    `resp` TEXT NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopifyproducts` (
    `id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `productid` VARCHAR(30) NOT NULL,
    `variantid` VARCHAR(30) NOT NULL,
    `gid_shopifyproductid` VARCHAR(100) NOT NULL,
    `gid_shopifyvariantid` VARCHAR(100) NOT NULL,
    `gid_shopifyinventoryid` VARCHAR(100) NOT NULL,
    `gid_shopifylocationid` VARCHAR(100) NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `ebayitemid` VARCHAR(30) NOT NULL,
    `dateofmodification` DATETIME(0) NOT NULL,
    `qty` INTEGER NOT NULL,
    `price` FLOAT NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER UNSIGNED NOT NULL,
    `tag` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_tags` (
    `id` INTEGER UNSIGNED NOT NULL,
    `tag_id` INTEGER UNSIGNED NULL,
    `task_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(50) NULL,
    `description` VARCHAR(1024) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `task_status` BOOLEAN NULL,
    `user_id` INTEGER UNSIGNED NULL,
    `category_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL,
    `ownername` VARCHAR(255) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `avatar_url` VARCHAR(50) NOT NULL,
    `shopurl` TEXT NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `catalogfetched` TINYINT NOT NULL,
    `shopifyimported` TINYINT NOT NULL,
    `fbainvnt` TINYINT NOT NULL,
    `tempcode` VARCHAR(30) NOT NULL,
    `installationstatus` TINYINT NOT NULL,
    `membershiptype` ENUM('free', 'paid') NOT NULL,
    `plan` INTEGER NOT NULL,
    `sync` TINYINT NOT NULL,
    `storecreated_at` DATETIME(0) NOT NULL,
    `storeupdated_at` DATETIME(0) NOT NULL,
    `plan_name` VARCHAR(255) NOT NULL,
    `skulimit` INTEGER NOT NULL DEFAULT 5,
    `skuconsumed` INTEGER NOT NULL,
    `tosaccepted` TINYINT NOT NULL,
    `includeoutofstock` TINYINT NOT NULL,
    `publishstatus` TINYINT NOT NULL,
    `multi_location_enabled` BOOLEAN NOT NULL DEFAULT false,
    `appswitch` BOOLEAN NOT NULL DEFAULT false,
    `keysemail` TINYINT NOT NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `paid_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` TIMESTAMP(0) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
