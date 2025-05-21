import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfunding } from "../target/types/crowdfunding";
const { SystemProgram, PublicKey, LAMPORTS_PER_SOL } = anchor.web3
import * as fs from "fs";
import * as path from "path";
import { assert } from "chai";

describe("Crowdfunding test cases", () => {

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;

    async function getLocalnetKeypair(): Promise<anchor.web3.Keypair> {
        const homedir = require('os').homedir();
        const keypairPath = path.join(homedir, '.config/solana/id.json');
        const secretKeyString = fs.readFileSync(keypairPath, "utf8");
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return anchor.web3.Keypair.fromSecretKey(secretKey);
    }


    it('Initialize Program Counter', async () => {
        console.log(`Wallet Account ${provider.wallet.publicKey.toString()}`)
        const myAccount = await getLocalnetKeypair();
        const balance = await provider.connection.getBalance(myAccount.publicKey);
        console.log(`Account ${myAccount.publicKey.toString()} have balance  ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);

        const [programStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('program_state')],
            program.programId
        )
        const programState = await program.account.programState.getAccountInfo(programStatePda)
        if (!programState) {

            const tx = await program.methods
                .initialize()
                .accountsPartial({
                    deployer: myAccount.publicKey,
                    programCounter: programStatePda,
                    systemProgram: SystemProgram.programId,
                })
                .signers([myAccount])
                .rpc()

            console.log('Initialize Transaction Signature:', tx)

        } else {
            console.log('Program account already exists. Skipping Program state Account creation')
        }
        const state = await program.account.programState.fetch(programStatePda)
        console.log('Program State: ', state)


    });


    it("Create a campaign", async () => {

        const myAccount = await getLocalnetKeypair();
        const balance = await provider.connection.getBalance(myAccount.publicKey);
        console.log(`Wallet Account ${myAccount.publicKey.toString()} have balance with ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);

        let CID: any, DONORS_COUNT: any, WITHDRAW_COUNT: any

        const [programStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('program_state')],
            program.programId
        )
        const state = await program.account.programState.fetch(programStatePda)
        CID = state.campaignCount.add(new anchor.BN(1))
        console.log("Program State ", state)
        const [campaignPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('compaigns'), CID.toArrayLike(Buffer, 'le', 8)],
            program.programId
        )

        const title = `Test Campaign Title #${CID.toString()}`
        const description = `Test Campaign description #${CID.toString()}`
        const image_url = `https://dummy_image_${CID.toString()}.png`
        const goal = new anchor.BN(25 * 1_000_000_000) // 25 SOLtoken

        const tx = await program.methods
            .createCampaign(title, description, image_url, goal)
            .accountsPartial({
                programCounter: programStatePda,
                campaign: campaignPda,
                creator: myAccount.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([myAccount])
            .rpc()

        console.log('Transaction Signature: ', tx)

        const campaign = await program.account.campaign.fetch(campaignPda)
        assert.notEqual(campaign,null)
        assert.equal(campaign.title,title)
        assert.equal(campaign.description,description)
        assert.equal(campaign.imageUrl,image_url)
        assert.ok(campaign.goal.eq(goal),"Campaign goal equal to provided goals")

    });



})