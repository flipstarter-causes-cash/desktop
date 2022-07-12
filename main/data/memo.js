const {Select, Insert} = require("./sqlite");

const GetProfileInfo = async (addresses) => {
    const query = "" +
        "SELECT " +
        "   profile_names.name AS name, " +
        "   profile_texts.profile AS profile, " +
        "   profile_pics.pic AS pic " +
        "FROM profiles " +
        "LEFT JOIN profile_names ON (profile_names.tx_hash = profiles.name) " +
        "LEFT JOIN profile_texts ON (profile_texts.tx_hash = profiles.profile) " +
        "LEFT JOIN profile_pics ON (profile_pics.tx_hash = profiles.pic) " +
        "WHERE profiles.address IN (" + Array(addresses.length).fill("?").join(", ") + ") "
    const results = await Select(query, addresses)
    if (!results || !results.length) {
        return undefined
    }
    return results[0]
}

const SaveMemoProfiles = async (profiles) => {
    let saveProfiles = []
    for (let i = 0; i < profiles.length; i++) {
        let {lock, name, profile, pic} = profiles[i]
        if (!lock || !lock.address || !name) {
            continue
        }
        saveProfiles.push({lock, name, profile, pic})
        if (name) {
            await Insert("INSERT OR IGNORE INTO profile_names (address, name, tx_hash) VALUES (?, ?, ?)", [
                lock.address, name.name, name.tx_hash])
        }
        if (profile) {
            await Insert("INSERT OR IGNORE INTO profile_texts (address, profile, tx_hash) VALUES (?, ?, ?)", [
                lock.address, profile.text, profile.tx_hash])
        }
        if (pic) {
            await Insert("INSERT OR IGNORE INTO profile_pics (address, pic, tx_hash) VALUES (?, ?, ?)", [
                lock.address, pic.pic, pic.tx_hash])
        }
    }
    if (!saveProfiles.length) {
        return
    }
    const query = "" +
        "INSERT OR REPLACE INTO profiles " +
        "   (address, name, profile, pic) " +
        "VALUES " + Array(saveProfiles.length).fill("(?, ?, ?, ?)").join(", ")
    const values = saveProfiles.map(profile => [
        profile.lock.address,
        profile.name ? profile.name.tx_hash : "",
        profile.profile ? profile.profile.tx_hash : "",
        profile.pic ? profile.pic.tx_hash : "",
    ]).flat()
    await Insert(query, values)
}

const GetRecentSetName = async (addresses) => {
    const query = "" +
        "SELECT " +
        "   profile_names.*, " +
        "   block_txs.block_hash AS block_hash " +
        "FROM profiles " +
        "LEFT JOIN profile_names ON (profile_names.tx_hash = profiles.name) " +
        "LEFT JOIN block_txs ON (block_txs.tx_hash = profiles.name) " +
        "WHERE profiles.address IN (" + Array(addresses.length).fill("?").join(", ") + ") "
    const results = await Select(query, addresses)
    if (!results || !results.length) {
        return undefined
    }
    return results[0]
}

const GetRecentSetProfile = async (addresses) => {
    const query = "" +
        "SELECT " +
        "   profile_texts.*, " +
        "   block_txs.block_hash AS block_hash " +
        "FROM profiles " +
        "LEFT JOIN profile_texts ON (profile_texts.tx_hash = profiles.profile) " +
        "LEFT JOIN block_txs ON (block_txs.tx_hash = profiles.profile) " +
        "WHERE profiles.address IN (" + Array(addresses.length).fill("?").join(", ") + ") "
    const results = await Select(query, addresses)
    if (!results || !results.length) {
        return undefined
    }
    return results[0]
}

const GetRecentSetPic = async (addresses) => {
    const query = "" +
        "SELECT " +
        "   profile_pics.*, " +
        "   block_txs.block_hash AS block_hash " +
        "FROM profiles " +
        "LEFT JOIN profile_pics ON (profile_pics.tx_hash = profiles.pic) " +
        "LEFT JOIN block_txs ON (block_txs.tx_hash = profiles.pic) " +
        "WHERE profiles.address IN (" + Array(addresses.length).fill("?").join(", ") + ") "
    const results = await Select(query, addresses)
    if (!results || !results.length) {
        return undefined
    }
    return results[0]
}

module.exports = {
    GetProfileInfo,
    SaveMemoProfiles,
    GetRecentSetName,
    GetRecentSetProfile,
    GetRecentSetPic,
}