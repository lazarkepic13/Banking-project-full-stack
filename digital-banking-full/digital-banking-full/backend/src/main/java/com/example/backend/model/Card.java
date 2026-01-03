package com.example.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cards")
@JsonIgnoreProperties(ignoreUnknown = true) // Ignoriši polja koja se ne šalju u JSON-u
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 16, max = 16, message = "Card number must be exactly 16 digits")
    @Pattern(regexp = "^[0-9]{16}$", message = "Card number must contain only digits")
    @Column(nullable = false, unique = true, length = 16)
    private String cardNumber; // Generiše se automatski ako nije postavljen

    @NotNull(message = "Card type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @JsonAlias("cardType")
    private CardType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CardStatus status = CardStatus.ACTIVE;

    // Account se ne validira jer se ne šalje u request-u, već se postavlja u
    // servisu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnore
    private Account account;

    // Transient polje za primanje accountId iz JSON-a (ne koristi se više, ali
    // ostavljamo za kompatibilnost)
    @JsonProperty("accountId")
    @jakarta.persistence.Transient
    @JsonIgnore // Ignoriši ovo polje jer se ne koristi
    private Long accountId;

    // Expiry date se ne validira jer se ne šalje u request-u, već se generiše u
    // servisu
    @Column(nullable = false)
    private LocalDate expiryDate; // Generiše se automatski (3 godine od danas) ako nije postavljen

    // CVV se ne validira jer se ne šalje u request-u, već se generiše u servisu
    @Column(nullable = false, length = 3)
    private String cvv; // Generiše se automatski ako nije postavljen

    // Cardholder name se ne validira jer se ne šalje u request-u, već se generiše u
    // servisu
    @Column(nullable = false, length = 100)
    private String cardholderName; // Generiše se automatski iz customer podataka ako nije postavljen

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
