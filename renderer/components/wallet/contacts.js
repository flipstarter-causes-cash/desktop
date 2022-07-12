import {useEffect, useRef, useState} from "react";
import GetWallet from "../util/wallet";
import form from "../../styles/form.module.css";
import bitcoin from "../util/bitcoin";
import {opcodes, script} from "@bitcoin-dot-com/bitcoincashjs2-lib";
import {CreateTransaction} from "./snippets/create_tx";

const Contacts = ({lastUpdate}) => {
    const setNameRef = useRef("")
    const setProfileRef = useRef("")
    const setPicRef = useRef("")
    const [profileInfo, setProfileInfo] = useState({
        mame: "Not set",
        profile: "Not set",
        pic: "Not set",
    })
    const utxosRef = useRef([])
    useEffect(async () => {
        const wallet = await GetWallet()
        const profileInfo = await window.electron.getProfileInfo(wallet.addresses)
        if (profileInfo !== undefined) {
            setProfileInfo(profileInfo)
        }
        utxosRef.current.value = await window.electron.getUtxos(wallet.addresses)
        utxosRef.current.value.sort((a, b) => {
            return b.value - a.value
        })
    }, [lastUpdate])
    const formSetNameSubmit = async (e) => {
        e.preventDefault()
        const name = setNameRef.current.value
        if (name && name.length > bitcoin.MaxOpReturn) {
            window.electron.showMessageDialog("Name length is too long (max: " + bitcoin.MaxOpReturn + ")")
            return
        }
        const nameOpReturnOutput = script.compile([
            opcodes.OP_RETURN,
            Buffer.from(bitcoin.Prefix.SetName, "hex"),
            Buffer.from(name),
        ])
        const wallet = await GetWallet()
        const recentSetName = await window.electron.getRecentSetName(wallet.addresses)
        let beatHash
        if (recentSetName && !recentSetName.block_hash) {
            beatHash = recentSetName.tx_hash
        }
        await CreateTransaction(wallet, utxosRef.current.value, nameOpReturnOutput, 0, beatHash)
    }
    const formSetProfileSubmit = async (e) => {
        e.preventDefault()
        const profile = setProfileRef.current.value
        if (profile && profile.length > bitcoin.MaxOpReturn) {
            window.electron.showMessageDialog("Profile length is too long (max: " + bitcoin.MaxOpReturn + ")")
            return
        }
        const profileOpReturnOutput = script.compile([
            opcodes.OP_RETURN,
            Buffer.from(bitcoin.Prefix.SetProfile, "hex"),
            Buffer.from(profile),
        ])
        const wallet = await GetWallet()
        const recentSetProfile = await window.electron.getRecentSetProfile(wallet.addresses)
        let beatHash
        if (recentSetProfile && !recentSetProfile.block_hash) {
            beatHash = recentSetProfile.tx_hash
        }
        await CreateTransaction(wallet, utxosRef.current.value, profileOpReturnOutput, 0, beatHash)
    }
    const formSetPicSubmit = async (e) => {
        e.preventDefault()
        const pic = setPicRef.current.value
        if (pic && pic.length > bitcoin.MaxOpReturn) {
            window.electron.showMessageDialog("Pic length is too long (max: " + bitcoin.MaxOpReturn + ")")
            return
        }
        const picOpReturnOutput = script.compile([
            opcodes.OP_RETURN,
            Buffer.from(bitcoin.Prefix.SetPic, "hex"),
            Buffer.from(pic),
        ])
        const wallet = await GetWallet()
        const recentSetPic = await window.electron.getRecentSetPic(wallet.addresses)
        let beatHash
        if (recentSetPic && !recentSetPic.block_hash) {
            beatHash = recentSetPic.tx_hash
        }
        await CreateTransaction(wallet, utxosRef.current.value, picOpReturnOutput, 0, beatHash)
    }
    return (
        <div>
            <p>
                Name: <b>{profileInfo.name}</b>
            </p>
            <p>
                Profile: <b>{profileInfo.profile}</b>
            </p>
            <p>
                Pic: <b>{profileInfo.pic}</b>
            </p>
            <form onSubmit={formSetNameSubmit}>
                <label>
                    <span className={form.span}>Set name:</span>
                    <input className={form.input} ref={setNameRef} type="text"/>
                </label>
                <input type="submit" value="Set"/>
            </form>
            <form onSubmit={formSetProfileSubmit}>
                <label>
                    <span className={form.span}>Set profile:</span>
                    <input className={form.input} ref={setProfileRef} type="text"/>
                </label>
                <input type="submit" value="Set"/>
            </form>
            <form onSubmit={formSetPicSubmit}>
                <label>
                    <span className={form.span}>Set pic:</span>
                    <input className={form.input} ref={setPicRef} type="text"/>
                </label>
                <input type="submit" value="Set"/>
            </form>
        </div>
    )
}

export default Contacts