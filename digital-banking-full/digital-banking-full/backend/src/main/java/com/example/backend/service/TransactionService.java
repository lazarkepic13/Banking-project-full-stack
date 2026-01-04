package com.example.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.InsufficientFundsException;
import com.example.backend.exception.InvalidAccountStatusException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Account;
import com.example.backend.model.Transaction;
import com.example.backend.model.TransactionStatus;
import com.example.backend.model.TransactionType;
import com.example.backend.repository.AccountRepository;
import com.example.backend.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllWithAccounts();
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));
        return transactionRepository.findByFromAccountOrToAccountWithAccounts(account);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        TransactionType type = transaction.getType();

        if (type == TransactionType.DEPOSIT) {
            return processDeposit(transaction);
        } else if (type == TransactionType.WITHDRAW) {
            return processWithdraw(transaction);
        } else if (type == TransactionType.TRANSFER) {
            return processTransfer(transaction);
        } else {
            throw new BadRequestException("Invalid transaction type: " + type);
        }
    }

    private Transaction processDeposit(Transaction transaction) {
        Account account = accountRepository.findById(transaction.getToAccount().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getStatus() != com.example.backend.model.AccountStatus.ACTIVE) {
            throw new InvalidAccountStatusException("Cannot deposit to inactive account");
        }

        account.setBalance(account.getBalance().add(transaction.getAmount()));
        accountRepository.save(account);

        transaction.setStatus(TransactionStatus.COMPLETED);
        return transactionRepository.save(transaction);
    }

    private Transaction processWithdraw(Transaction transaction) {
        Account account = accountRepository.findById(transaction.getFromAccount().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getStatus() != com.example.backend.model.AccountStatus.ACTIVE) {
            throw new InvalidAccountStatusException("Cannot withdraw from inactive account");
        }

        BigDecimal newBalance = account.getBalance().subtract(transaction.getAmount());
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new InsufficientFundsException("Insufficient funds");
        }

        account.setBalance(newBalance);
        accountRepository.save(account);

        transaction.setStatus(TransactionStatus.COMPLETED);
        return transactionRepository.save(transaction);
    }

    private Transaction processTransfer(Transaction transaction) {
        Account fromAccount = accountRepository.findById(transaction.getFromAccount().getId())
                .orElseThrow(() -> new ResourceNotFoundException("From account not found"));

        Account toAccount = accountRepository.findById(transaction.getToAccount().getId())
                .orElseThrow(() -> new ResourceNotFoundException("To account not found"));

        if (fromAccount.getStatus() != com.example.backend.model.AccountStatus.ACTIVE) {
            throw new InvalidAccountStatusException("Cannot transfer from inactive account");
        }

        if (toAccount.getStatus() != com.example.backend.model.AccountStatus.ACTIVE) {
            throw new InvalidAccountStatusException("Cannot transfer to inactive account");
        }

        BigDecimal newBalance = fromAccount.getBalance().subtract(transaction.getAmount());
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new InsufficientFundsException("Insufficient funds");
        }

        fromAccount.setBalance(newBalance);
        toAccount.setBalance(toAccount.getBalance().add(transaction.getAmount()));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        transaction.setStatus(TransactionStatus.COMPLETED);
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction transactionDetails) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        transaction.setType(transactionDetails.getType());
        transaction.setAmount(transactionDetails.getAmount());
        transaction.setStatus(transactionDetails.getStatus());
        transaction.setFromAccount(transactionDetails.getFromAccount());
        transaction.setToAccount(transactionDetails.getToAccount());
        transaction.setDescription(transactionDetails.getDescription());

        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }
}
