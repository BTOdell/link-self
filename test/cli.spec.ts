import {expect} from "chai";
import {lstatSync, Stats} from "fs";
import {join} from "path";

const root: string = join(__dirname, "..");

// Run the CLI script
require(join(root, "bin", "cli"));

describe("cli", function () {
    it("should have created the symlink in node_modules", function () {
        function stat(): Stats {
            return lstatSync(join(root, "node_modules", "link-self"));
        }
        expect(stat).to.not.throw();
        expect(stat().isSymbolicLink()).to.equal(true);
    });
});

describe("module", function () {
    it("should throw a custom error", function () {
        expect(() => require("link-self")).to.throw(Error, "link-self is designed to be used as a dev tool, not a module!");
    });
});
