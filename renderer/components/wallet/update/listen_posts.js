import {LikesQuery, PostFields, TxQuery} from "../../util/graphql";

const ListenPosts = ({txHashes, setLastUpdate}) => {
    const query = `
        subscription($txHashes: [String!]) {
            posts(hashes: $txHashes) {
                tx_hash
                text
                lock {
                    address
                }
                ${TxQuery}
                ${LikesQuery}
                parent {
                    ${PostFields}
                }
                replies {
                    ${PostFields}
                }
            }
        }
        `
    const handler = async (data) => {
        await window.electron.saveMemoPosts(data.posts)
        setLastUpdate((new Date()).toISOString())
    }
    const onclose = () => {
        console.log("GraphQL posts listener subscribe close, reconnecting in 2 seconds!")
        setTimeout(() => {
            close = ListenPosts({txHashes, setLastUpdate})
        }, 2000)
    }
    let close = window.electron.listenGraphQL({query, variables: {txHashes}, handler, onclose})
    return () => close()

}

export default ListenPosts
