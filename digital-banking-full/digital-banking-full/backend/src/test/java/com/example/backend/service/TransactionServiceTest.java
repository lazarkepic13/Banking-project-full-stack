package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.exception.InsufficientFundsException;
import com.example.backend.exception.InvalidAccountStatusException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Account;
import com.example.backend.model.AccountStatus;
import com.example.backend.model.Customer;
import com.example.backend.model.Transaction;
import com.example.backend.model.TransactionStatus;
import com.example.backend.model.TransactionType;
import com.example.backend.repository.AccountRepository;
import com.example.backend.repository.TransactionRepository;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Account fromAccount;
    private Account toAccount;
    private Customer customer;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .build();

        fromAccount = Account.builder()
                .id(1L)
                .accountNumber("ACC001")
                .balance(new BigDecimal("1000.00"))
                .status(AccountStatus.ACTIVE)
                .customer(customer)
                .build();

        toAccount = Account.builder()
                .id(2L)
                .accountNumber("ACC002")
                .balance(new BigDecimal("500.00"))
                .status(AccountStatus.ACTIVE)
                .customer(customer)
                .build();

        transaction = Transaction.builder()
                .id(1L)
                .type(TransactionType.DEPOSIT)
                .amount(new BigDecimal("100.00"))
                .status(TransactionStatus.PENDING)
                .toAccount(toAccount)
                .build();
    }

    @Test
    void testGetAllTransactions_Success() {
        when(transactionRepository.findAllWithAccounts()).thenReturn(Collections.singletonList(transaction));

        List<Transaction> result = transactionService.getAllTransactions();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(transactionRepository).findAllWithAccounts();
    }

    @Test
    void testGetTransactionById_Success() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));

        Optional<Transaction> result = transactionService.getTransactionById(1L);

        assertNotNull(result);
        assertEquals(transaction, result.get());
        verify(transactionRepository).findById(1L);
    }

    @Test
    void testGetTransactionsByAccount_Success() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
        when(transactionRepository.findByFromAccountOrToAccountWithAccounts(fromAccount))
                .thenReturn(Collections.singletonList(transaction));

        List<Transaction> result = transactionService.getTransactionsByAccount(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(accountRepository).findById(1L);
        verify(transactionRepository).findByFromAccountOrToAccountWithAccounts(fromAccount);
    }

    @Test
    void testGetTransactionsByAccount_AccountNotFound() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            transactionService.getTransactionsByAccount(999L);
        });

        verify(accountRepository).findById(999L);
    }

    @Test
    void testCreateTransaction_Deposit_Success() {
        transaction.setType(TransactionType.DEPOSIT);
        Account toAccountWithId = Account.builder().id(2L).build();
        transaction.setToAccount(toAccountWithId);

        when(accountRepository.findById(2L)).thenReturn(Optional.of(toAccount));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transaction result = transactionService.createTransaction(transaction);

        assertNotNull(result);
        assertEquals(TransactionStatus.COMPLETED, result.getStatus());
        assertEquals(new BigDecimal("600.00"), toAccount.getBalance());
        verify(accountRepository).findById(2L);
        verify(accountRepository).save(toAccount);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void testCreateTransaction_Deposit_InactiveAccount() {
        transaction.setType(TransactionType.DEPOSIT);
        toAccount.setStatus(AccountStatus.BLOCKED);
        Account toAccountWithId = Account.builder().id(2L).build();
        transaction.setToAccount(toAccountWithId);

        when(accountRepository.findById(2L)).thenReturn(Optional.of(toAccount));

        assertThrows(InvalidAccountStatusException.class, () -> {
            transactionService.createTransaction(transaction);
        });

        verify(accountRepository).findById(2L);
    }

    @Test
    void testCreateTransaction_Withdraw_Success() {
        transaction.setType(TransactionType.WITHDRAW);
        transaction.setFromAccount(fromAccount);
        transaction.setToAccount(null);
        Account fromAccountWithId = Account.builder().id(1L).build();
        transaction.setFromAccount(fromAccountWithId);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transaction result = transactionService.createTransaction(transaction);

        assertNotNull(result);
        assertEquals(TransactionStatus.COMPLETED, result.getStatus());
        assertEquals(new BigDecimal("900.00"), fromAccount.getBalance());
        verify(accountRepository).findById(1L);
        verify(accountRepository).save(fromAccount);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void testCreateTransaction_Withdraw_InsufficientFunds() {
        transaction.setType(TransactionType.WITHDRAW);
        transaction.setAmount(new BigDecimal("2000.00"));
        Account fromAccountWithId = Account.builder().id(1L).build();
        transaction.setFromAccount(fromAccountWithId);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThrows(InsufficientFundsException.class, () -> {
            transactionService.createTransaction(transaction);
        });

        verify(accountRepository).findById(1L);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void testCreateTransaction_Transfer_Success() {
        transaction.setType(TransactionType.TRANSFER);
        transaction.setFromAccount(fromAccount);
        Account fromAccountWithId = Account.builder().id(1L).build();
        Account toAccountWithId = Account.builder().id(2L).build();
        transaction.setFromAccount(fromAccountWithId);
        transaction.setToAccount(toAccountWithId);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(toAccount));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transaction result = transactionService.createTransaction(transaction);

        assertNotNull(result);
        assertEquals(TransactionStatus.COMPLETED, result.getStatus());
        assertEquals(new BigDecimal("900.00"), fromAccount.getBalance());
        assertEquals(new BigDecimal("600.00"), toAccount.getBalance());
        verify(accountRepository).findById(1L);
        verify(accountRepository).findById(2L);
        verify(accountRepository).save(fromAccount);
        verify(accountRepository).save(toAccount);
        verify(transactionRepository).save(any(Transaction.class));
    }
}

