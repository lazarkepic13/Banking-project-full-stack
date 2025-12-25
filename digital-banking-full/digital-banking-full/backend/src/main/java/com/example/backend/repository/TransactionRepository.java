package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Account;
import com.example.backend.model.Transaction;
import com.example.backend.model.TransactionStatus;
import com.example.backend.model.TransactionType;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFromAccount(Account account);

    List<Transaction> findByToAccount(Account account);

    List<Transaction> findByFromAccountOrToAccount(Account fromAccount, Account toAccount);

    List<Transaction> findByType(TransactionType type);

    List<Transaction> findByStatus(TransactionStatus status);

    List<Transaction> findByFromAccountAndCreatedAtBetween(
            Account account,
            LocalDateTime startDate,
            LocalDateTime endDate);

    List<Transaction> findByToAccountAndCreatedAtBetween(
            Account account,
            LocalDateTime startDate,
            LocalDateTime endDate);
}

