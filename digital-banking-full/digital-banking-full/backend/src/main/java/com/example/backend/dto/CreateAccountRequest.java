package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import com.example.backend.model.AccountType;

public class CreateAccountRequest {

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    public CreateAccountRequest() {
    }

    public CreateAccountRequest(AccountType accountType, Long customerId) {
        this.accountType = accountType;
        this.customerId = customerId;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
}

