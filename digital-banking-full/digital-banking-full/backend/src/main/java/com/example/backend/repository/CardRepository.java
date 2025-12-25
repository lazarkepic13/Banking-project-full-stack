package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Account;
import com.example.backend.model.Card;
import com.example.backend.model.CardStatus;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    Optional<Card> findByCardNumber(String cardNumber);

    boolean existsByCardNumber(String cardNumber);

    List<Card> findByAccount(Account account);

    List<Card> findByAccountAndStatus(Account account, CardStatus status);

    List<Card> findByStatus(CardStatus status);
}

