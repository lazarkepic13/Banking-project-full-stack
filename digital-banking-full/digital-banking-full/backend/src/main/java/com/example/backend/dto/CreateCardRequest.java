package com.example.backend.dto;

import com.example.backend.model.CardType;

import jakarta.validation.constraints.NotNull;

public class CreateCardRequest {

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotNull(message = "Card type is required")
    private String cardType; // Prima string iz frontenda, konvertuje se u CardType u servisu

    public CreateCardRequest() {
    }

    public CreateCardRequest(Long accountId, String cardType) {
        this.accountId = accountId;
        this.cardType = cardType;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    // Helper metoda za konverziju u CardType enum
    public CardType getCardTypeEnum() {
        if (cardType == null) {
            return null;
        }
        try {
            return CardType.valueOf(cardType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid card type: " + cardType + ". Valid types are: DEBIT, CREDIT, VIRTUAL");
        }
    }
}
