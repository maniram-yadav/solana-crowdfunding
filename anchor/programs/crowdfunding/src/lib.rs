use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;
#[allow(unused_imports)]
use states::*;

// Program ID declaration (replace with your own ID when deploying)
declare_id!("8tfuvG2FVPUE41keGjgybaftAiw9UQBK3FGtYxMyzJ5W");

#[program]
pub mod fundus {
    use super::*;

}
