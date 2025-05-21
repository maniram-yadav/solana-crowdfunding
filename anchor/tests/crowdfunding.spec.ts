import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Crowdfunding } from "../target/types/crowdfunding";
const { SystemProgram, PublicKey, LAMPORTS_PER_SOL } = anchor.web3
import * as fs from "fs";
import * as path from "path";
import { assert } from "chai";
import { Keypair } from "@solana/web3.js";

const toggleProvider = (user: 'deployer' | 'creator') => {
  let wallet: any
  if (user === 'creator') {
    const keypairData = JSON.parse(fs.readFileSync('user.json', 'utf-8'))
    wallet = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(keypairData))
  } else {
    const keypairPath = `${process.env.HOME}/.config/solana/id.json`
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'))
    wallet = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(keypairData))
  }

  const defaultProvider = anchor.AnchorProvider.local()

  const provider = new anchor.AnchorProvider(
    defaultProvider.connection,
    new anchor.Wallet(wallet),
    defaultProvider.opts
  )

  anchor.setProvider(provider)

  return provider
}


describe("Crowdfunding test cases", () => {

    let  provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;
    let CID: any, DONORS_COUNT: any, WITHDRAW_COUNT: any
    const creator = Keypair.generate();

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

        const [programStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from('program_state')],
            program.programId
        )
        const state = await program.account.programState.fetch(programStatePda)
        CID = state.campaignCount.add(new anchor.BN(1))
        console.log("Program State ", state)
        const [campaignPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
            program.programId
        )
        
        const title = `Test Campaign Title #${CID.toString()}`
        const description = `Test Campaign description #${CID.toString()}`
        const image_url = `https://dummy_image_${CID.toString()}.png`
        const goal = new anchor.BN(1000 * 1_000_000_000) // 25 SOLtoken
        console.log(`CID : ${CID}`)
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
        DONORS_COUNT = campaign.donors
        WITHDRAW_COUNT = campaign.withdrawals
    });


    
  it('Update  campaign', async () => {
    
    const myAccount = await getLocalnetKeypair();
    
    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
      program.programId
    )
     
    const campaignState = await program.account.programState.getAccountInfo(campaignPda)
        
    console.log("campaignPda ",campaignPda)
    console.log(`CID : ${CID}`)
    
    const title = `Update Test Campaign Title #${CID.toString()}`
    const description = `Updated Test Campaign description #${CID.toString()}`
    const image_url = `https://dummy_image_${CID.toString()}.png`
    const goal = new anchor.BN(3000 * 1_000_000_000) // 30 SOLtoken

    const tx = await program.methods
      .updateCampaign(CID, title, description, image_url, goal)
      .accountsPartial({
        campaign: campaignPda,
        creator: myAccount.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([myAccount])
      .rpc()

    console.log('Transaction Signature:', tx)

    const campaign = await program.account.campaign.fetch(campaignPda)
    console.log('Campaign:', campaign)
  })

  it('donate to campaign', async () => {

    const myAccount = await getLocalnetKeypair();
    const donor = provider.wallet

    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const [transactionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('donor'),
        donor.publicKey.toBuffer(),
        CID.toArrayLike(Buffer, 'le', 8),
        DONORS_COUNT.add(new anchor.BN(1)).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    )

    const donorBefore = await provider.connection.getBalance(donor.publicKey)
    const campaignBefore = await provider.connection.getBalance(campaignPda)

    const donation_amount = new anchor.BN(Math.round(3.1 * 1_000_000_000))
    const tx = await program.methods
      .donate(CID, donation_amount)
      .accountsPartial({
        campaign: campaignPda,
        transaction: transactionPda,
        donor: donor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    console.log('Transaction Signature:', tx)

    const donorAfter = await provider.connection.getBalance(donor.publicKey)
    const campaignAfter = await provider.connection.getBalance(campaignPda)
    const transaction = await program.account.transaction.fetch(transactionPda)

    console.log('Donation:', transaction)

    console.log(`
      donor balance before: ${donorBefore},
      donor balance after: ${donorAfter}, 
    `)

    console.log(`
      campaign balance before: ${campaignBefore},
      campaign balance after: ${campaignAfter}, 
    `)
  })

  it('withdraw from campaign', async () => {
    const myAccount = await getLocalnetKeypair();
  

    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      program.programId
    )

    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const [transactionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('withdraw'),
        myAccount.publicKey.toBuffer(),
        CID.toArrayLike(Buffer, 'le', 8),
        WITHDRAW_COUNT.add(new anchor.BN(1)).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    )

    const creatorBefore = await provider.connection.getBalance(
      myAccount.publicKey
    )
    const campaignBefore = await provider.connection.getBalance(campaignPda)

    const programState = await program.account.programState.fetch(
      programStatePda
    )
    const platformBefore = await provider.connection.getBalance(
      programState.platformAddress
    )

    const donation_amount = new anchor.BN(Math.round(1.8 * 1_000_000_000))
    const tx = await program.methods
      .withdraw(CID, donation_amount)
      .accountsPartial({
        programState: programStatePda,
        campaign: campaignPda,
        transaction: transactionPda,
        creator: myAccount.publicKey,
        platformAddress: programState.platformAddress,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    console.log('Transaction Signature:', tx)

    const creatorAfter = await provider.connection.getBalance(myAccount.publicKey)
    const campaignAfter = await provider.connection.getBalance(campaignPda)
    const transaction = await program.account.transaction.fetch(transactionPda)

    const platformAfter = await provider.connection.getBalance(
      programState.platformAddress
    )

    console.log('Withdrawal:', transaction)

    console.log(`
      creator balance before: ${creatorBefore},
      creator balance after: ${creatorAfter}, 
    `)

    console.log(`
      platform balance before: ${platformBefore},
      platform balance after: ${platformAfter}, 
    `)

    console.log(`
      campaign balance before: ${campaignBefore},
      campaign balance after: ${campaignAfter}, 
    `)
  })

  it('delete a campaign', async () => {
    const myAccount = await getLocalnetKeypair();
    
    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('campaign'), CID.toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const tx = await program.methods
      .deleteCampaign(CID)
      .accountsPartial({
        campaign: campaignPda,
        creator: myAccount.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    console.log('Transaction Signature:', tx)

    const campaign = await program.account.campaign.fetch(campaignPda)
    console.log('Campaign:', campaign)
  })

  it('updates platform fee', async () => {
        const myAccount = await getLocalnetKeypair();


    const [programStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      program.programId
    )

    const stateBefore = await program.account.programState.fetch(
      programStatePda
    )
    console.log('state:', stateBefore)

    const tx = await program.methods
      .updatePlatformSettings(new anchor.BN(7))
      .accountsPartial({
        updater: myAccount.publicKey,
        programState: programStatePda,
      })
      .signers([myAccount])
      .rpc()

    console.log('Transaction Signature:', tx)

    const stateAfter = await program.account.programState.fetch(programStatePda)
    console.log('state:', stateAfter)
  })
})
