import { NodeVM } from "vm2";
import Mocha from "mocha";
import fs from "fs";
import path from "path";

// Create a new VM instance
const vm = new NodeVM({
  console: "inherit",
  sandbox: {},
  require: {
    external: true,
    builtin: ["fs", "path", "mocha"],
    root: "./",
    mock: {
      fs: {
        readFileSync: () => "Nice try!",
      },
    },
  },
});

// Mocha test code as a string
const testCode = `
const assert = require('assert');

describe('Math operations', () => {
  it('should add two numbers correctly', () => {
    assert.equal(2 + 2, 4);
  });
});
`;

// Load and run the Mocha test code inside the VM
vm.run(testCode);

// Retrieve the Mocha instance from the VM's global context
const mochaInstance = vm.run("new mocha.Mocha()");

// Add the test code to the Mocha instance
mochaInstance._compile(testCode, "");

// Run the Mocha tests
mochaInstance.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
