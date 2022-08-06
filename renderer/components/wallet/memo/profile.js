import {useEffect, useState} from "react";
import {opcodes, script} from "@bitcoin-dot-com/bitcoincashjs2-lib";
import profile from "../../../styles/profile.module.css";
import Modal from "../../modal/modal";
import seed from "../../modal/seed.module.css";
import bitcoin from "../../util/bitcoin";
import GetWallet from "../../util/wallet";
import {UpdateMemoHistory} from "../update/index.js";
import {CreateTransaction} from "../snippets/create_tx";
import {Modals} from "./index";
import Links from "../snippets/links";
import Post from "./post";

const Profile = ({onClose, address, utxosRef, lastUpdate, setModal, setAddress}) => {
    const [profileInfo, setProfileInfo] = useState({
        name: "",
        profile: "",
        pic: "",
    })
    const [lastProfileUpdate, setLastProfileUpdate] = useState(false)
    const [posts, setPosts] = useState([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [picData, setPicData] = useState(undefined)
    const [isSelf, setIsSelf] = useState(true)
    useEffect(async () => {
        const profileInfo = await window.electron.getProfileInfo([address])
        if (profileInfo === undefined) {
            return
        }
        setProfileInfo(profileInfo)
        if (profileInfo.pic !== undefined) {
            const picData = await window.electron.getPic(profileInfo.pic)
            setPicData(picData)
        }
        const wallet = await GetWallet()
        let isSelf = false
        for (const walletAddress of wallet.addresses) {
            if (walletAddress === address) {
                isSelf = true
                break
            }
        }
        setIsSelf(isSelf)
        const recentFollow = await window.electron.getRecentFollow(wallet.addresses, address)
        setIsFollowing(recentFollow !== undefined && !recentFollow.unfollow)
        const posts = await window.electron.getPosts([address])
        setPosts(posts)
    }, [lastUpdate, lastProfileUpdate])
    useEffect(async () => {
        await UpdateMemoHistory({addresses: [address], setLastUpdate: setLastProfileUpdate})
    }, [address])
    const clickFollow = async (address, unfollow) => {
        const followOpReturnOutput = script.compile([
            opcodes.OP_RETURN,
            Buffer.from(unfollow ? bitcoin.Prefix.Unfollow : bitcoin.Prefix.Follow, "hex"),
            Buffer.from(bitcoin.GetPkHashFromAddress(address), "hex"),
        ])
        const wallet = await GetWallet()
        const recentFollow = await window.electron.getRecentFollow(wallet.addresses, address)
        let beatHash
        if (recentFollow && !recentFollow.block_hash) {
            beatHash = recentFollow.tx_hash
        }
        await CreateTransaction(wallet, utxosRef.current.value, followOpReturnOutput, 0, beatHash)
    }
    return (
        <Modal onClose={onClose}>
            <div className={profile.header_modal}>
                <div className={profile.pic}>
                    <img alt={"Profile image"} className={profile.img}
                         src={picData ? `data:image/png;base64,${Buffer.from(picData).toString("base64")}` :
                             "/default-profile.jpg"}/>
                </div>
                <div className={profile.info}>
                    <h2>{profileInfo.name ? profileInfo.name : "Name not set"}</h2>
                    <p className={profile.text}>
                        <Links>{profileInfo.profile ? profileInfo.profile : "Profile not set"}</Links>
                    </p>
                    <p>Address: {address}</p>
                    <p>
                        {!isSelf && <button onClick={() => clickFollow(address, isFollowing)}>
                            {isFollowing ? "Unfollow" : "Follow"}</button>}
                        <button onClick={() => setModal(Modals.Following)}>Following</button>
                        <button onClick={() => setModal(Modals.Followers)}>Followers</button>
                    </p>
                </div>
            </div>
            <div className={profile.posts}>
                {posts.map((post, i) => {
                    return (
                        <Post key={i} post={post} setAddress={setAddress}/>
                    )
                })}
            </div>
            <div className={seed.buttons}>
                <button onClick={onClose}>Close</button>
            </div>
        </Modal>
    )
}

export default Profile
