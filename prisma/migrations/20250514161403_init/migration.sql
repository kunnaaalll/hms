-- CreateTable
CREATE TABLE `Room` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('DeluxeQueen', 'LuxuryKingSuite', 'StandardTwin', 'FamilySuite') NOT NULL,
    `pricePerNight` INTEGER NOT NULL,
    `capacity` INTEGER NOT NULL,
    `amenities` JSON NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `dataAiHint` VARCHAR(191) NULL,
    `availabilityScore` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('Available', 'Occupied', 'Maintenance') NOT NULL DEFAULT 'Available',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingRequest` (
    `id` VARCHAR(191) NOT NULL,
    `guestName` VARCHAR(191) NOT NULL,
    `guestEmail` VARCHAR(191) NOT NULL,
    `checkInDate` DATETIME(3) NOT NULL,
    `checkOutDate` DATETIME(3) NOT NULL,
    `numberOfGuests` INTEGER NOT NULL,
    `roomType` ENUM('DeluxeQueen', 'LuxuryKingSuite', 'StandardTwin', 'FamilySuite') NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `totalPrice` INTEGER NOT NULL,
    `status` ENUM('Pending', 'Confirmed', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BookingRequest_guestEmail_key`(`guestEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantOrder` (
    `id` VARCHAR(191) NOT NULL,
    `tableNumber` VARCHAR(191) NOT NULL,
    `items` JSON NOT NULL,
    `totalPrice` INTEGER NOT NULL,
    `status` ENUM('Pending', 'Preparing', 'Served', 'Paid') NOT NULL DEFAULT 'Pending',
    `orderTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HousekeepingTask` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `roomType` ENUM('DeluxeQueen', 'LuxuryKingSuite', 'StandardTwin', 'FamilySuite') NOT NULL,
    `task` ENUM('FullClean', 'TowelChange', 'TurndownService', 'MaintenanceCheck') NOT NULL,
    `status` ENUM('Pending', 'InProgress', 'Completed', 'Blocked') NOT NULL DEFAULT 'Pending',
    `assignedTo` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `lastCleaned` DATETIME(3) NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuestServiceRequest` (
    `id` VARCHAR(191) NOT NULL,
    `guestName` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `serviceType` ENUM('Laundry', 'CabBooking', 'SpaAppointment', 'Concierge', 'WakeUpCall') NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `status` ENUM('Requested', 'InProgress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Requested',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotelSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `hotelName` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `enableOnlineBookings` BOOLEAN NOT NULL DEFAULT true,
    `currencySymbol` VARCHAR(191) NOT NULL DEFAULT '₹',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BookingRequest` ADD CONSTRAINT `BookingRequest_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HousekeepingTask` ADD CONSTRAINT `HousekeepingTask_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestServiceRequest` ADD CONSTRAINT `GuestServiceRequest_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
