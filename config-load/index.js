const fs = require("fs");

let config;

module.exports = {
    config: () => {
        if (config != null) return config;
    
        const config_file = "./config.json";
    
        const raw_config = fs.readFileSync(config_file, "utf8");
        config = JSON.parse(raw_config);
        return config;
    }
}
