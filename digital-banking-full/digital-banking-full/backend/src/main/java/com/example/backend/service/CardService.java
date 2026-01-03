package com.example.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.CreateCardRequest;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Account;
import com.example.backend.model.Card;
import com.example.backend.model.CardStatus;
import com.example.backend.model.CardType;
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

    @Transactional
    public Card createCard(CreateCardRequest request) {
        if (request.getAccountId() == null) {
            throw new BadRequestException("Account ID must be specified when creating a card");
        }

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Account not found with id: " + request.getAccountId()));

        // Eksplicitno učita customer da bi izbegli LazyInitializationException
        // Koristi Hibernate.initialize() ili pristupi customer polju dok je sesija
        // aktivna
        var customer = account.getCustomer();
        if (customer == null) {
            throw new BadRequestException("Account must have an associated customer to create a card");
        }

        // Generiši cardholder name iz customer podataka
        // Pristupamo customer podacima dok je sesija aktivna (@Transactional)
        String firstName = customer.getFirstName() != null
                ? customer.getFirstName()
                : "";
        String lastName = customer.getLastName() != null
                ? customer.getLastName()
                : "";
        String cardholderName = (firstName + " " + lastName).trim();

        // Konvertuj string u CardType enum
        CardType cardType = request.getCardTypeEnum();
        if (cardType == null) {
            cardType = CardType.DEBIT; // Default na DEBIT
        }

        // Log za debugging - proveri šta se šalje u bazu
        System.out.println("=== CREATING CARD ===");
        System.out.println("CardType from request: " + request.getCardType());
        System.out.println("CardType enum: " + cardType);
        System.out.println("CardType enum name: " + cardType.name());

        // Kreiraj Card objekat sa svim generisanim podacima
        Card card = Card.builder()
                .account(account)
                .type(cardType)
                .status(CardStatus.ACTIVE)
                .cardNumber(generateCardNumber())
                .expiryDate(LocalDate.now().plusYears(3))
                .cvv(generateCVV())
                .cardholderName(cardholderName)
                .build();

        System.out.println("Card object created with type: " + card.getType().name());

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
        // Generiši 16-cifreni broj kartice
        Random random = new Random();
        StringBuilder cardNumber = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            cardNumber.append(random.nextInt(10));
        }
        return cardNumber.toString();
    }

    private String generateCVV() {
        // Generiši 3-cifreni CVV
        Random random = new Random();
        return String.format("%03d", random.nextInt(1000));
    }
}
