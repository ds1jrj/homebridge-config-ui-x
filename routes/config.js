var fs = require("fs");
var path = require("path");
var https = require("https");
var plugins = require("../plugins");
var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/login");
    }
}, function (req, res, next) {
    var config = require(hb.config);

    var server = {
        name: (config.bridge.name || "Homebridge"),
        mac: (config.bridge.username || "CC:22:3D:E3:CE:30"),
        port: (config.bridge.port || 51826),
        pin: (config.bridge.pin || "031-45-154")
    };

    var platforms = [];

    config.platforms.forEach(function (platform) {
        platforms.push({
            id: platform.platform,
            name: platform.name,
            json: JSON.stringify(platform, null, 4)
        });
    });

    var accessories = [];

    config.platforms.forEach(function (accessory) {
        accessories.push({
            id: accessory.accessory,
            name: accessory.name,
            json: JSON.stringify(accessory, null, 4)
        });
    });

    res.render("config", {
        controller: "config",
        title: "Configuration",
        server: server,
        platforms: platforms,
        accrssories: accessories
    });
});

router.post("/", function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/login");
    }
}, function (req, res, next) {
    var config = require(hb.config);

    config.bridge.name = req.body.name;
    config.bridge.username = req.body.mac;
    config.bridge.port = (!isNaN(parseInt(req.body.port))) ? parseInt(req.body.port) : 51826;
    config.bridge.pin = req.body.pin;

    config.platforms = [];

    req.body.platform.forEach(function (key) {
        if (req.body[key + "-delete"] == "false" && req.body[key + "-type"] == "platform") {
            var platform = JSON.parse(req.body[key + "-code"]);

            platform.name = req.body[key + "-name"];
            config.platforms.push(platform);
        }
    });

    config.accessories = [];

    req.body.platform.forEach(function (key) {
        if (req.body[key + "-delete"] == "false" && req.body[key + "-type"] == "accessory") {
            var accessory = JSON.parse(req.body[key + "-code"]);

            accessory.name = req.body[key + "-name"];
            config.accessories.push(accessory);
        }
    });

    fs.renameSync(hb.config, hb.config + "." + Math.floor(new Date() / 1000));
    fs.appendFileSync(hb.config, JSON.stringify(config, null, 4));

    app.get("log")("Configuration Changed.");

    var exec = require("child_process").exec;

    exec(hb.restart, function () {
        setTimeout(function () {
            res.redirect(302, "/config");
        }, 5000);
    });
});

router.get("/backup", function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/login");
    }
}, function (req, res, next) {
    var config = require(hb.config);

    res.setHeader("Content-disposition", "attachment; filename=config.json");
    res.setHeader("Content-type", "application/json");

    res.write(JSON.stringify(config, null, 4), function (err) {
        res.end();
    });
});

router.get("/installed", function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/login");
    }
}, function (req, res, next) {
    plugins.installed(function (err, pkgs) {
        res.render("installed", {
            controller: "plugins",
            title: "Configuration",
            packages: pkgs
        });
    });
});

router.get("/plugins", function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/login");
    }
}, function (req, res, next) {
    res.render("plugins", {
        controller: "plugins",
        title: "Configuration"
    });
});

module.exports = router;
