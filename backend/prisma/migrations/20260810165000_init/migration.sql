CREATE TABLE "Brew" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "coffeeGrams" INTEGER NOT NULL,
    "waterGrams" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL
);
