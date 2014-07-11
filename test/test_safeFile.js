/**
 * Unit tests for safeFile library
 */
var assert = require ("assert");
var fs = require ("fs");
var path = require ("path");

var file = require ("../lib/safeFile");
var SafeFileError = require ("../lib/SafeFileError").SafeFileError;
var cc = SafeFileError.prototype;

// get path to test directory for location of test files
var path = path.join (path.dirname (fs.realpathSync (__filename)));

var fn = null;
var result = null;

// clean up common function
function cleanup (base) {
    if ((base !== null) && (base !== undefined)) {
        if (fs.existsSync (base + ".eph")) {
            fs.unlinkSync (base + ".eph");
        }
        if (fs.existsSync (base + ".rdy")) {
            fs.unlinkSync (base + ".rdy");
        }
        if (fs.existsSync (base)) {
            fs.unlinkSync (base);
        }
        if (fs.existsSync (base + ".bak")) {
            fs.unlinkSync (base + ".bak");
        }
        if (fs.existsSync (base + ".bk2")) {
            fs.unlinkSync (base + ".bk2");
        }
    }
}

describe ("readFileSync", function () {
    describe ("Read a valid file", function () {
        var rsBase1 = path + "/rs1.txt";
        before (function () {
            fs.writeFileSync (rsBase1, "test base");
        });

        after (function () {
            cleanup (rsBase1);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.readFileSync (rsBase1);
            };
            assert.doesNotThrow (fn, SafeFileError);
        });
    });

    describe ("Read with file name (null)", function () {
        it ("should throw exception (INVALID_NAME)", function () {
            fn = function () {
                file.readFileSync (null);
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.INVALID_NAME);
                return (true);
            });
        });
    });

    describe ("Read a non-existent file", function () {
        it ("should throw an exception (INVALID_NAME)", function () {
            fn = function () {
                file.readFileSync ("nofile.json");
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.DOES_NOT_EXIST);
                return (true);
            });
        });
    });

    describe ("Read a directory, not a file", function () {
        var rsBase2 = path + "/rs2dir";
        before (function () {
            if (fs.existsSync (rsBase2) === false) {
                fs.mkdirSync (rsBase2);
            }
        });

        after (function () {
            if (fs.existsSync (rsBase2)) {
                fs.rmdirSync (rsBase2);
            }
        });

        it ("should throw an exception (IS_NOT_A_FILE)", function () {
            fn = function () {
                file.readFileSync (rsBase2);
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.IS_NOT_A_FILE);
                return (true);
            });
        });
    });
});

describe ("writeFileSync", function () {
    describe ("Write a file without error", function () {
        var wsBase1 = path + "/ws1.txt";
        before (function () {
            if (fs.existsSync (wsBase1)) {
                fs.unlinkSync (wsBase1);
            }
        });

        after (function () {
            cleanup (wsBase1);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.writeFileSync (wsBase1, "test");
            };
            assert.doesNotThrow (fn, SafeFileError);
        });
    });

    describe ("Write with file name (null)", function () {
        it ("should throw an exception (INVALID_NAME)", function () {
            fn = function () {
                file.writeFileSync (null, "test");
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.INVALID_NAME);
                return (true);
            });
        });
    });

    describe ("Write to a directory, not a file", function () {
        var wsBase2 = path + "/ws2dir";
        before (function () {
            if (fs.existsSync (wsBase2) === false) {
                fs.mkdirSync (wsBase2);
            }
        });

        after (function () {
            if (fs.existsSync (wsBase2)) {
                fs.rmdirSync (wsBase2);
            }
        });

        it ("should throw an exception (IS_NOT_A_FILE)", function () {
            fn = function () {
                file.writeFileSync (wsBase2, "test");
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.IS_NOT_A_FILE);
                return (true);
            });
        });
    });
});

describe ("safeGetState", function () {
    describe ("Normal state", function () {
        var sgsBase1 = path + "/sgs1.txt";
        before (function () {
            fs.writeFileSync (sgsBase1, "test base");
        });

        after (function () {
            cleanup (sgsBase1);
        });

        it ("should return SAFE_NORMAL", function () {
            result = file.safeGetState (sgsBase1);
            assert.strictEqual (result, cc.SAFE_NORMAL);
        });
    });

    describe ("Unrecoverable state", function () {
        var sgsBase2 = path + "/sgs2.txt";
        before (function () {
            fs.writeFileSync (sgsBase2 + ".eph", "test eph");
        });

        after (function () {
            cleanup (sgsBase2);
        });

        it ("should return SAFE_INTERVENE", function () {
            result = file.safeGetState (sgsBase2);
            assert.strictEqual (result, cc.SAFE_INTERVENE);
        });
    });

    describe ("Recoverable state (ready file)", function () {
        var sgsBase3 = path + "/sgs3.txt";
        before (function () {
            fs.writeFileSync (sgsBase3 + ".rdy", "test rdy");
        });

        after (function () {
            cleanup (sgsBase3);
        });

        it ("should return SAFE_RECOVERABLE", function () {
            result = file.safeGetState (sgsBase3);
            assert.strictEqual (result, cc.SAFE_RECOVERABLE);
        });
    });

    describe ("Recoverable state (backup file)", function () {
        var sgsBase4 = path + "/sgs4.txt";
        before (function () {
            fs.writeFileSync (sgsBase4 + ".bak", "test bak");
        });

        after (function () {
            cleanup (sgsBase4);
        });

        it ("should return SAFE_RECOVERABLE", function () {
            result = file.safeGetState (sgsBase4);
            assert.strictEqual (result, cc.SAFE_RECOVERABLE);
        });
    });

    describe ("Recoverable state (tertiary file)", function () {
        var sgsBase5 = path + "/sgs5.txt";
        before (function () {
            fs.writeFileSync (sgsBase5 + ".bk2", "test bk2");
        });

        after (function () {
            cleanup (sgsBase5);
        });

        it ("should return SAFE_RECOVERABLE", function () {
            result = file.safeGetState (sgsBase5);
            assert.strictEqual (result, cc.SAFE_RECOVERABLE);
        });
    });

    describe ("Invalid file (null)", function () {
        it ("should return SAFE_INVALID_FILE", function () {
            result = file.safeGetState (null);
            assert.strictEqual (result, cc.INVALID_NAME);
        });
    });

    describe ("Invalid file (doesn't exist)", function () {
        it ("should return SAFE_INVALID_FILE", function () {
            result = file.safeGetState ("nofile.txt");
            assert.strictEqual (result, cc.DOES_NOT_EXIST);
        });
    });

    describe ("Invalid file (directory)", function () {
        var sgsName5 = path;
        it ("should return SAFE_INVALID_FILE", function () {
            result = file.safeGetState (sgsName5);
            assert.strictEqual (result, cc.IS_NOT_A_FILE);
        });
    });
});

describe ("safeRecover", function () {
    describe ("Recover with file name (null)", function () {
        it ("should throw exception (INVALID_NAME)", function () {
            fn = function () {
                file.safeRecover (null);
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.INVALID_NAME);
                return (true);
            });
        });
    });

    describe ("Recover with a non-existent file", function () {
        it ("should throw an exception (INVALID_NAME)", function () {
            fn = function () {
                file.safeRecover ("nofile.json");
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.DOES_NOT_EXIST);
                return (true);
            });
        });
    });

    describe ("Recover with a directory, not a file", function () {
        var recBase1 = path + "/rec1dir";
        before (function () {
            if (fs.existsSync (recBase1) === false) {
                fs.mkdirSync (recBase1);
            }
        });

        after (function () {
            if (fs.existsSync (recBase1)) {
                fs.rmdirSync (recBase1);
            }
        });

        it ("should throw an exception (IS_NOT_A_FILE)", function () {
            fn = function () {
                file.safeRecover (recBase1);
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.IS_NOT_A_FILE);
                return (true);
            });
        });
    });

    describe ("Recover with base file", function () {
        var recBase2 = path + "/rec2.txt";
        before (function () {
            fs.writeFileSync (recBase2, "test base");
        });

        after (function () {
            cleanup (recBase2);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeRecover (recBase2);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (recBase2 + ".eph"), false);
            assert.strictEqual (fs.existsSync (recBase2 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (recBase2), true);
            assert.strictEqual (fs.existsSync (recBase2 + ".bak"), false);
            assert.strictEqual (fs.existsSync (recBase2 + ".bk2"), false);
        });
    });

    describe ("Recover with ephemeral state file", function () {
        var recBase3 = path + "/rec3.txt";
        before (function () {
            fs.writeFileSync (recBase3 + ".eph", "test eph");
        });

        after (function () {
            cleanup (recBase3);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeRecover (recBase3);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (recBase3 + ".eph"), false);
            assert.strictEqual (fs.existsSync (recBase3 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (recBase3), false);
            assert.strictEqual (fs.existsSync (recBase3 + ".bak"), false);
            assert.strictEqual (fs.existsSync (recBase3 + ".bk2"), false);
        });
    });

    describe ("Recover with ready state file", function () {
        var recBase4 = path + "/rec4.txt";
        before (function () {
            fs.writeFileSync (recBase4 + ".rdy", "test rdy");
        });

        after (function () {
            cleanup (recBase4);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeRecover (recBase4);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (recBase4 + ".eph"), false);
            assert.strictEqual (fs.existsSync (recBase4 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (recBase4), true);
            assert.strictEqual (fs.existsSync (recBase4 + ".bak"), false);
            assert.strictEqual (fs.existsSync (recBase4 + ".bk2"), false);
        });
    });

    describe ("Recover with backup file", function () {
        var recBase5 = path + "/rec5.txt";
        before (function () {
            fs.writeFileSync (recBase5 + ".bak", "test bak");
        });

        after (function () {
            cleanup (recBase5);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeRecover (recBase5);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (recBase5 + ".eph"), false);
            assert.strictEqual (fs.existsSync (recBase5 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (recBase5), true);
            assert.strictEqual (fs.existsSync (recBase5 + ".bak"), false);
            assert.strictEqual (fs.existsSync (recBase5 + ".bk2"), false);
        });
    });

    describe ("Recover with tertiary file", function () {
        var recBase6 = path + "/rec6.txt";
        before (function () {
            fs.writeFileSync (recBase6 + ".bk2", "test bk2");
        });

        after (function () {
            cleanup (recBase6);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeRecover (recBase6);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (recBase6 + ".eph"), false);
            assert.strictEqual (fs.existsSync (recBase6 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (recBase6), true);
            assert.strictEqual (fs.existsSync (recBase6 + ".bak"), false);
            assert.strictEqual (fs.existsSync (recBase6 + ".bk2"), false);
        });
    });

    describe ("Recover with ready, base files", function () {
        var recBase7 = path + "/rec7.txt";
        before (function () {
            fs.writeFileSync (recBase7 + ".rdy", "test rdy");
            fs.writeFileSync (recBase7, "test base");
        });

        after (function () {
            cleanup (recBase7);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeRecover (recBase7);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (recBase7 + ".eph"), false);
            assert.strictEqual (fs.existsSync (recBase7 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (recBase7), true);
            assert.strictEqual (fs.existsSync (recBase7 + ".bak"), true);
            assert.strictEqual (fs.existsSync (recBase7 + ".bk2"), false);
        });
    });

    describe ("Recover with ready, backup files", function () {
        var recBase8 = path + "/rec8.txt";
        before (function () {
            fs.writeFileSync (recBase8 + ".rdy", "test rdy");
            fs.writeFileSync (recBase8 + ".bak", "test bak");
        });

        after (function () {
            cleanup (recBase8);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeRecover (recBase8);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (recBase8 + ".eph"), false);
            assert.strictEqual (fs.existsSync (recBase8 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (recBase8), true);
            assert.strictEqual (fs.existsSync (recBase8 + ".bak"), true);
            assert.strictEqual (fs.existsSync (recBase8 + ".bk2"), false);
        });
    });

    describe ("Recover with ready, base, backup files", function () {
        var recBase9 = path + "/rec9.txt";
        before (function () {
            fs.writeFileSync (recBase9 + ".rdy", "test rdy");
            fs.writeFileSync (recBase9, "test base");
            fs.writeFileSync (recBase9 + ".bak", "test bak");
        });

        after (function () {
            cleanup (recBase9);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeRecover (recBase9);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (recBase9 + ".eph"), false);
            assert.strictEqual (fs.existsSync (recBase9 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (recBase9), true);
            assert.strictEqual (fs.existsSync (recBase9 + ".bak"), true);
            assert.strictEqual (fs.existsSync (recBase9 + ".bk2"), false);
        });
    });
});

describe ("basic safeReadFileSync", function () {
    describe ("Read a normal file", function () {
        var srsBase1 = path + "/srs1.txt";
        before (function () {
            fs.writeFileSync (srsBase1, "test base");
        });

        after (function () {
            cleanup (srsBase1);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeReadFileSync (srsBase1);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (srsBase1 + ".eph"), false);
            assert.strictEqual (fs.existsSync (srsBase1 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (srsBase1), true);
            assert.strictEqual (fs.existsSync (srsBase1 + ".bak"), false);
            assert.strictEqual (fs.existsSync (srsBase1 + ".bk2"), false);
        });
    });

    describe ("Read recovery from ready file", function () {
        var srsBase2 = path + "/srs2.txt";
        before (function () {
            fs.writeFileSync (srsBase2 + ".rdy", "test rdy");
        });

        after (function () {
            cleanup (srsBase2);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeReadFileSync (srsBase2);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (srsBase2 + ".eph"), false);
            assert.strictEqual (fs.existsSync (srsBase2 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (srsBase2), true);
            assert.strictEqual (fs.existsSync (srsBase2 + ".bak"), false);
            assert.strictEqual (fs.existsSync (srsBase2 + ".bk2"), false);
        });
    });

    describe ("Read with file name (null)", function () {
        it ("should throw exception (INVALID_NAME)", function () {
            fn = function () {
                file.safeReadFileSync (null);
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.INVALID_NAME);
                return (true);
            });
        });
    });

    describe ("Read a non-existent file", function () {
        it ("should throw an exception (INVALID_NAME)", function () {
            fn = function () {
                file.safeReadFileSync ("nofile.json");
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.DOES_NOT_EXIST);
                return (true);
            });
        });
    });

    describe ("Read a directory, not a file", function () {
        var srsBase2 = path + "/srs2dir";
        before (function () {
            if (fs.existsSync (srsBase2) === false) {
                fs.mkdirSync (srsBase2);
            }
        });

        after (function () {
            if (fs.existsSync (srsBase2)) {
                fs.rmdirSync (srsBase2);
            }
        });

        it ("should throw an exception (IS_NOT_A_FILE)", function () {
            fn = function () {
                file.safeReadFileSync (srsBase2);
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.IS_NOT_A_FILE);
                return (true);
            });
        });
    });
});

describe ("basic safeWriteFileSync", function () {
    describe ("Write a new file", function () {
        var swsBase1 = path + "/sws1.txt";
        after (function () {
            cleanup (swsBase1);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeWriteFileSync (swsBase1, "test");
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (swsBase1 + ".eph"), false);
            assert.strictEqual (fs.existsSync (swsBase1 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (swsBase1), true);
            assert.strictEqual (fs.existsSync (swsBase1 + ".bak"), false);
            assert.strictEqual (fs.existsSync (swsBase1 + ".bk2"), false);

        });
    });

    describe ("Write a file, already exists", function () {
        var swsBase2 = path + "/sws2.txt";
        before (function () {
            fs.writeFileSync (swsBase2, "test base");
        });

        after (function () {
            cleanup (swsBase2);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeWriteFileSync (swsBase2, "test");
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (swsBase2 + ".eph"), false);
            assert.strictEqual (fs.existsSync (swsBase2 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (swsBase2), true);
            assert.strictEqual (fs.existsSync (swsBase2 + ".bak"), true);
            assert.strictEqual (fs.existsSync (swsBase2 + ".bk2"), false);

        });
    });

    describe ("Write with file name (null)", function () {
        it ("should throw an exception (INVALID_NAME)", function () {
            fn = function () {
                file.safeWriteFileSync (null, "test");
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.INVALID_NAME);
                return (true);
            });
        });
    });

    describe ("Write to a directory, not a file", function () {
        var swsBase2 = path + "/sws2dir";
        before (function () {
            if (fs.existsSync (swsBase2) === false) {
                fs.mkdirSync (swsBase2);
            }
        });

        after (function () {
            if (fs.existsSync (swsBase2)) {
                fs.rmdirSync (swsBase2);
            }
        });

        it ("should throw an exception (IS_NOT_A_FILE)", function () {
            fn = function () {
                file.safeWriteFileSync (swsBase2, "test");
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.IS_NOT_A_FILE);
                return (true);
            });
        });
    });
});

describe ("recoverable safeReadFileSync", function () {
    describe ("Find just a ephemeral state file ", function () {
        var rsrsBase1 = path + "/rsrs1.txt";
        before (function () {
            fs.writeFileSync (rsrsBase1 + ".eph", "test eph");
        });

        after (function () {
            cleanup (rsrsBase1);
        });

        it ("should throw an exception (DOES_NOT_EXIST)", function () {
            fn = function () {
                file.safeReadFileSync (rsrsBase1);
            };
            assert.throws (fn, function (e) {
                assert.strictEqual (e instanceof SafeFileError, true);
                assert.strictEqual (e.code, cc.DOES_NOT_EXIST);
                assert.strictEqual (fs.existsSync (rsrsBase1 + ".eph"), true);
                assert.strictEqual (fs.existsSync (rsrsBase1 + ".rdy"), false);
                assert.strictEqual (fs.existsSync (rsrsBase1), false);
                assert.strictEqual (fs.existsSync (rsrsBase1 + ".bak"), false);
                assert.strictEqual (fs.existsSync (rsrsBase1 + ".bk2"), false);
                return (true);
            });
        });
    });

    describe ("Find just a ready state file ", function () {
        var rsrsBase2 = path + "/rsrs2.txt";
        before (function () {
            fs.writeFileSync (rsrsBase2 + ".rdy", "test rdy");
        });

        after (function () {
            cleanup (rsrsBase2);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeReadFileSync (rsrsBase2);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rsrsBase2 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rsrsBase2 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rsrsBase2), true);
            assert.strictEqual (fs.existsSync (rsrsBase2 + ".bak"), false);
            assert.strictEqual (fs.existsSync (rsrsBase2 + ".bk2"), false);
        });
    });

    describe ("Find ready and base state files", function () {
        var rsrsBase3 = path + "/rsrs3.txt";
        before (function () {
            fs.writeFileSync (rsrsBase3, "test base");
            fs.writeFileSync (rsrsBase3 + ".rdy", "test rdy");
        });

        after (function () {
            cleanup (rsrsBase3);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeReadFileSync (rsrsBase3);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rsrsBase3 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rsrsBase3 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rsrsBase3), true);
            assert.strictEqual (fs.existsSync (rsrsBase3 + ".bak"), true);
            assert.strictEqual (fs.existsSync (rsrsBase3 + ".bk2"), false);
        });
    });

    describe ("Find ready and backup files", function () {
        var rsrsBase4 = path + "/rsrs4.txt";
        before (function () {
            fs.writeFileSync (rsrsBase4 + ".rdy", "test rdy");
            fs.writeFileSync (rsrsBase4 + ".bak", "test bak");
        });

        after (function () {
            cleanup (rsrsBase4);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeReadFileSync (rsrsBase4);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rsrsBase4 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rsrsBase4 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rsrsBase4), true);
            assert.strictEqual (fs.existsSync (rsrsBase4 + ".bak"), true);
            assert.strictEqual (fs.existsSync (rsrsBase4 + ".bk2"), false);
        });
    });

    describe ("Find ready, base and backup files", function () {
        var rsrsBase5 = path + "/rsrs5.txt";
        before (function () {
            fs.writeFileSync (rsrsBase5 + ".rdy", "test rdy");
            fs.writeFileSync (rsrsBase5, "test base");
            fs.writeFileSync (rsrsBase5 + ".bak", "test bak");
        });

        after (function () {
            cleanup (rsrsBase5);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeReadFileSync (rsrsBase5);
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rsrsBase5 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rsrsBase5 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rsrsBase5), true);
            assert.strictEqual (fs.existsSync (rsrsBase5 + ".bak"), true);
            assert.strictEqual (fs.existsSync (rsrsBase5 + ".bk2"), false);
        });
    });
});

describe ("recoverable safeWriteFileSync", function () {
    describe ("Find just a ephemeral state file ", function () {
        var rswsBase1 = path + "/rsw1.txt";
        before (function () {
            fs.writeFileSync (rswsBase1 + ".eph", "test eph");
        });

        after (function () {
            cleanup (rswsBase1);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeWriteFileSync (rswsBase1, "test");
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rswsBase1 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rswsBase1 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rswsBase1), true);
            assert.strictEqual (fs.existsSync (rswsBase1 + ".bak"), false);
            assert.strictEqual (fs.existsSync (rswsBase1 + ".bk2"), false);
        });
    });

    describe ("Find just a ready state file ", function () {
        var rswsBase2 = path + "/rsws2.txt";
        before (function () {
            fs.writeFileSync (rswsBase2 + ".rdy", "test rdy");
        });

        after (function () {
            cleanup (rswsBase2);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeWriteFileSync (rswsBase2, "test");
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rswsBase2 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rswsBase2 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rswsBase2), true);
            assert.strictEqual (fs.existsSync (rswsBase2 + ".bak"), true);
            assert.strictEqual (fs.existsSync (rswsBase2 + ".bk2"), false);
        });
    });

    describe ("Find ready and base state files", function () {
        var rswsBase3 = path + "/rsws3.txt";
        before (function () {
            fs.writeFileSync (rswsBase3, "test base");
            fs.writeFileSync (rswsBase3 + ".rdy", "test rdy");
        });

        after (function () {
            cleanup (rswsBase3);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeWriteFileSync (rswsBase3, "test");
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rswsBase3 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rswsBase3 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rswsBase3), true);
            assert.strictEqual (fs.existsSync (rswsBase3 + ".bak"), true);
            assert.strictEqual (fs.existsSync (rswsBase3 + ".bk2"), false);
        });
    });

    describe ("Find ready and backup files", function () {
        var rswsBase4 = path + "/rsws4.txt";
        before (function () {
            fs.writeFileSync (rswsBase4 + ".rdy", "test rdy");
            fs.writeFileSync (rswsBase4 + ".bak", "test bak");
        });

        after (function () {
            cleanup (rswsBase4);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeWriteFileSync (rswsBase4, "test");
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rswsBase4 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rswsBase4 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rswsBase4), true);
            assert.strictEqual (fs.existsSync (rswsBase4 + ".bak"), true);
            assert.strictEqual (fs.existsSync (rswsBase4 + ".bk2"), false);
        });
    });

    describe ("Find ready, base and backup files", function () {
        var rswsBase5 = path + "/rsws5.txt";
        before (function () {
            fs.writeFileSync (rswsBase5 + ".rdy", "test rdy");
            fs.writeFileSync (rswsBase5, "test base");
            fs.writeFileSync (rswsBase5 + ".bak", "test bak");
        });

        after (function () {
            cleanup (rswsBase5);
        });

        it ("should not throw an exception", function () {
            fn = function () {
                file.safeWriteFileSync (rswsBase5, "test");
            };
            assert.doesNotThrow (fn, SafeFileError);
            assert.strictEqual (fs.existsSync (rswsBase5 + ".eph"), false);
            assert.strictEqual (fs.existsSync (rswsBase5 + ".rdy"), false);
            assert.strictEqual (fs.existsSync (rswsBase5), true);
            assert.strictEqual (fs.existsSync (rswsBase5 + ".bak"), true);
            assert.strictEqual (fs.existsSync (rswsBase5 + ".bk2"), false);
        });
    });
});
