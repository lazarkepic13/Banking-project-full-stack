package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Account;
import com.example.backend.model.Card;
import com.example.backend.model.CardStatus;
import com.example.backend.repository.AccountRepository;
import com.example.backend.repository.CardRepository;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;

    public CardService(CardRepository cardRepository, AccountRepository accountRepository) {
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
    }

    public List<Card> getAllCards() {
        return cardRepository.findAll();
    }

    public Optional<Card> getCardById(Long id) {
        return cardRepository.findById(id);
    }

    public Optional<Card> getCardByNumber(String cardNumber) {
        return cardRepository.findByCardNumber(cardNumber);
    }

    public List<Card> getCardsByAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));
        return cardRepository.findByAccount(account);
    }

    public Card createCard(Card card) {
        if (card.getAccount() == null || card.getAccount().getId() == null) {
            throw new BadRequestException("Account must be specified when creating a card");
        }

        Account account = accountRepository.findById(card.getAccount().getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Account not found with id: " + card.getAccount().getId()));

        card.setAccount(account);

        if (card.getCardNumber() == null || card.getCardNumber().isEmpty()) {
            card.setCardNumber(generateCardNumber());
        }

        return cardRepository.save(card);
    }

    public Card updateCard(Long id, Card cardDetails) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + id));

        card.setCardNumber(cardDetails.getCardNumber());
        card.setType(cardDetails.getType());
        card.setStatus(cardDetails.getStatus());
        card.setExpiryDate(cardDetails.getExpiryDate());
        card.setCvv(cardDetails.getCvv());
        card.setCardholderName(cardDetails.getCardholderName());

        return cardRepository.save(card);
    }

    public void deleteCard(Long id) {
        if (!cardRepository.existsById(id)) {
            throw new ResourceNotFoundException("Card not found with id: " + id);
        }
        cardRepository.deleteById(id);
    }

    public Card blockCard(Long id) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + id));

        card.setStatus(CardStatus.BLOCKED);
        return cardRepository.save(card);
    }

    public Card unblockCard(Long id) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + id));

        card.setStatus(CardStatus.ACTIVE);
        return cardRepository.save(card);
    }

    private String generateCardNumber() {
        return String.format("%016d", System.currentTimeMillis() % 10000000000000000L);
    }
}
