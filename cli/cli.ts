#!/usr/bin/env node

import {dirname, join, relative} from "path";
import {lstatSync, Stats, symlink} from "fs";

/**
 * Starts at the given directory and attempts to find the nearest package.json
 * by traversing up the directory structure.
 * @param dir
 */
function findPackageJson(dir: string): string | null {
    do {
        const tryPackageJson: string = join(dir, "package.json");
        const stat: Stats = lstatSync(tryPackageJson);
        if (stat.isFile()) {
            return tryPackageJson;
        }
        const newDir = dirname(dir);
        if (dir === newDir) {
            return null;
        }
        dir = newDir;
    } while (true);
}

// Find package.json using current working directory
const packageJsonPath: string | null = findPackageJson(process.cwd());
if (packageJsonPath === null) {
    console.error("Unable to locate package.json");
    process.exit(1);
}
// Load package.json
let packageJson: any;
try {
    packageJson = require(packageJsonPath);
} catch (err) {
    console.error("Unable to load package.json: " + err);
    process.exit(1);
}
if (!packageJson || typeof packageJson !== "object") {
    console.error("Invalid package.json format.");
    process.exit(1);
}
if (typeof packageJson.name !== "string") {
    console.error("Package.json does not have a 'name' field.");
    process.exit(1);
}
const packageName: string = packageJson.name;
if (!packageName) {
    console.error("Package name is empty!");
    process.exit(1);
}

// Use containing directory to generate link path in node_modules
const packageDirectory: string = dirname(packageJsonPath);
const nodeModulesDirectory: string = join(packageDirectory, "node_modules");
const linkPath: string = join(nodeModulesDirectory, packageName);
symlink(relative(nodeModulesDirectory, packageDirectory), linkPath, "dir", function(err) {
    if (err) {
        if (err.code === "EEXIST") {
            console.warn("File/dir/symlink already exists.");
            return;
        }
        throw err;
    }
});
