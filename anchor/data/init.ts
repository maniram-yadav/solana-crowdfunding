import 'dotenv/config'
import * as anchor from '@coral-xyz/anchor'
import { Crowdfunding } from '../target/types/crowdfunding'
import { Program } from "@coral-xyz/anchor";
import fs from 'fs'
import { getClusterURL } from './helper'
const { SystemProgram, PublicKey } = anchor.web3

const main = async (cluster: string) => {

  const connection = new anchor.web3.Connection(
    getClusterURL(cluster),
    'confirmed'
  )

  const keypairPath = `${process.env.HOME}/.config/solana/id.json`
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'))
  const wallet = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(keypairData))

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    {
      commitment: 'confirmed',
    }
  )

  anchor.setProvider(provider)

  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>;
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    program.programId
  )

  try {
    const state = await program.account.programState.fetch(programStatePda)
    console.log(`Program already initialized, status: ${state.initialized}`)
  } catch (error) {
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        programCounter: programStatePda,
        deployer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    await connection.confirmTransaction(tx, 'finalized')
    console.log('Program initialized successfully.', tx)
  }
}

const cluster: string = process.env.NEXT_PUBLIC_CLUSTER || 'localhost'
main(cluster).catch((error) => console.log(error))

