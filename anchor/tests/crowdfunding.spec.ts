import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfunding } from "../target/types/crowdfunding";
import { Keypair } from '@solana/web3.js';
const { SystemProgram, PublicKey } = anchor.web3


describe("voting", () => {

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const wallet = provider.wallet as anchor.Wallet;

    const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;


    it("Create a campaign", async () => {

        // const myAccount = anchor.web3.Keypair.generate();
        console.log("Using Signer as " + wallet.publicKey)

        let CID: any, DONORS_COUNT: any, WITHDRAW_COUNT: any

        const [programStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('program_state')],
            program.programId
        )


        const state = await program.account.programState.fetch(programStatePda)
        CID = state.campaignCount.add(new anchor.BN(1))

        const [campaignPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
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
                creator: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([wallet.payer])
            .rpc()

        console.log('Transaction Signature:', tx)

        const campaign = await program.account.campaign.fetch(campaignPda)
        console.log('Campaign:', campaign)
        DONORS_COUNT = campaign.donors
        WITHDRAW_COUNT = campaign.withdrawals

        console.log("Your transaction signature", tx);
    });

})