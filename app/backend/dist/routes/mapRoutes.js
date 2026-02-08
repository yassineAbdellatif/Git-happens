"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mapController_1 = require("../controllers/mapController");
const router = (0, express_1.Router)();
router.get('/directions', mapController_1.getRoute);
exports.default = router;
//# sourceMappingURL=mapRoutes.js.map