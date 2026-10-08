-- Panda Auth - PUSL-V4
-- Paste this at the very top of your script.

local PUSL = loadstring(game:HttpGet("https://secure.pandauth.com/pv4/lib"))()
if not PUSL or type(PUSL.configure) ~= "function" then
    return warn("[Panda] Library failed to initialize.")
end

PUSL.configure({
    serviceId = "aniflixx",
})

local key = "USER_KEY_HERE" -- replace with your own key input
local result = PUSL.validate(key)

if not result.success then
    warn("[Panda] Get a key: " .. PUSL.getKeyUrl())
    return
end

print("[Panda] Authenticated. Premium:", result.isPremium)

-- Your protected code goes below this line.
