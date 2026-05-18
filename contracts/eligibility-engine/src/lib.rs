use soroban_sdk::{contracttype, contracterror, Address, BytesN, Vec, U256, Env, token};

use crate::policy_registry::{Policy, Condition, ConditionType, LogicType};

#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum EligibilityError {
    PolicyNotFound = 1,
    PolicyInactive = 2,
    EligibilityCheckFailed = 3,
    InvalidCondition = 4,
    Unauthorized = 5,
}

#[derive(Clone)]
#[contracttype]
pub struct EligibilityResult {
    pub eligible: bool,
    pub policy_id: BytesN<32>,
    pub timestamp: U256,
    pub reason: Option<Vec<u8>>,
}

#[contract]
pub struct EligibilityEngine;

impl EligibilityEngine {
    pub fn check_eligibility(
        e: Env,
        user: Address,
        policy: Policy,
    ) -> EligibilityResult {
        if !policy.active {
            return EligibilityResult {
                eligible: false,
                policy_id: policy.id,
                timestamp: e.ledger().timestamp(),
                reason: Some(b"Policy is inactive".to_vec()),
            };
        }

        let result = match policy.logic_type {
            LogicType::And => Self::evaluate_and(&e, &user, &policy.conditions),
            LogicType::Or => Self::evaluate_or(&e, &user, &policy.conditions),
        };

        EligibilityResult {
            eligible: result,
            policy_id: policy.id,
            timestamp: e.ledger().timestamp(),
            reason: None,
        }
    }

    fn evaluate_and(e: &Env, user: &Address, conditions: &Vec<Condition>) -> bool {
        let len = conditions.len();
        if len == 0 {
            return true;
        }

        for i in 0..len {
            let condition = conditions.get(i).unwrap();
            if !Self::evaluate_condition(e, user, &condition) {
                return false;
            }
        }
        true
    }

    fn evaluate_or(e: &Env, user: &Address, conditions: &Vec<Condition>) -> bool {
        let len = conditions.len();
        if len == 0 {
            return false;
        }

        for i in 0..len {
            let condition = conditions.get(i).unwrap();
            if Self::evaluate_condition(e, user, &condition) {
                return true;
            }
        }
        false
    }

    fn evaluate_condition(e: &Env, user: &Address, condition: &Condition) -> bool {
        match condition.condition_type.clone() {
            ConditionType::TokenBalance => {
                Self::check_token_balance(e, user, condition)
            }
            ConditionType::NftOwnership => {
                Self::check_nft_ownership(e, user, condition)
            }
            ConditionType::TxCount => {
                Self::check_tx_count(e, user, condition)
            }
        }
    }

    fn check_token_balance(e: &Env, user: &Address, condition: &Condition) -> bool {
        let asset = match &condition.asset {
            Some(a) => a.clone(),
            None => return false,
        };

        let operator = match &condition.operator {
            Some(o) => o.clone(),
            None => return false,
        };

        let required_value = match &condition.value {
            Some(v) => v.clone(),
            None => return false,
        };

        let client = token::Client::new(e, &asset);
        let balance = client.balance(user.clone());

        let op_bytes = operator.to_vec();
        if op_bytes == b">=" {
            balance >= required_value
        } else if op_bytes == b">" {
            balance > required_value
        } else if op_bytes == b"==" {
            balance == required_value
        } else if op_bytes == b"<=" {
            balance <= required_value
        } else if op_bytes == b"<" {
            balance < required_value
        } else {
            false
        }
    }

    fn check_nft_ownership(_e: &Env, _user: &Address, _condition: &Condition) -> bool {
        true
    }

    fn check_tx_count(_e: &Env, _user: &Address, _condition: &Condition) -> bool {
        true
    }
}

mod policy_registry {
    use soroban_sdk::{contracttype, Address, BytesN, Vec, U256};

    #[derive(Clone)]
    #[contracttype]
    pub enum LogicType {
        And,
        Or,
    }

    #[derive(Clone)]
    #[contracttype]
    pub enum ConditionType {
        TokenBalance,
        NftOwnership,
        TxCount,
    }

    #[derive(Clone)]
    #[contracttype]
    pub struct Condition {
        pub condition_type: ConditionType,
        pub asset: Option<BytesN<32>>,
        pub collection_id: Option<BytesN<32>>,
        pub operator: Option<BytesN<4>>,
        pub value: Option<U256>,
    }

    #[derive(Clone)]
    #[contracttype]
    pub struct Policy {
        pub id: BytesN<32>,
        pub creator: Address,
        pub name: Vec<u8>,
        pub description: Vec<u8>,
        pub logic_type: LogicType,
        pub conditions: Vec<Condition>,
        pub expiration_seconds: U256,
        pub active: bool,
        pub created_at: U256,
        pub updated_at: U256,
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_evaluate_and() {
        let env = Env::default();
        let conditions = Vec::new(&env);
        let user = Address::from_string(&"GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD".try_into().unwrap());

        assert!(EligibilityEngine::evaluate_and(&env, &user, &conditions));
    }

    #[test]
    fn test_evaluate_or() {
        let env = Env::default();
        let conditions = Vec::new(&env);
        let user = Address::from_string(&"GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD".try_into().unwrap());

        assert!(!EligibilityEngine::evaluate_or(&env, &user, &conditions));
    }
}