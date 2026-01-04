package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.backend.dto.CreateAccountRequest;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Account;
import com.example.backend.model.AccountStatus;
import com.example.backend.model.AccountType;
import com.example.backend.model.Customer;
import com.example.backend.repository.AccountRepository;
import com.example.backend.repository.CustomerRepository;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private AccountService accountService;

    private Customer customer;
    private Account account;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .build();

        account = Account.builder()
                .id(1L)
                .accountNumber("ACC123")
                .accountType(AccountType.CHECKING)
                .balance(java.math.BigDecimal.ZERO)
                .status(AccountStatus.ACTIVE)
                .customer(customer)
                .build();
    }

    @Test
    void testCreateAccount_Success() {
        CreateAccountRequest request = new CreateAccountRequest();
        request.setCustomerId(1L);
        request.setAccountType(AccountType.CHECKING);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account result = accountService.createAccount(request);

        assertNotNull(result);
        assertEquals(AccountType.CHECKING, result.getAccountType());
        assertEquals(AccountStatus.ACTIVE, result.getStatus());
        assertNotNull(result.getAccountNumber());
        verify(customerRepository).findById(1L);
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void testCreateAccount_CustomerNotFound() {
        CreateAccountRequest request = new CreateAccountRequest();
        request.setCustomerId(999L);
        request.setAccountType(AccountType.CHECKING);

        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            accountService.createAccount(request);
        });
    }

    @Test
    void testBlockAccount_Success() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account result = accountService.blockAccount(1L);

        assertNotNull(result);
        assertEquals(AccountStatus.BLOCKED, result.getStatus());
        verify(accountRepository).findById(1L);
        verify(accountRepository).save(account);
    }

    @Test
    void testBlockAccount_NotFound() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            accountService.blockAccount(999L);
        });
    }

    @Test
    void testActivateAccount_Success() {
        account.setStatus(AccountStatus.BLOCKED);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Account result = accountService.activateAccount(1L);

        assertNotNull(result);
        assertEquals(AccountStatus.ACTIVE, result.getStatus());
        verify(accountRepository).findById(1L);
        verify(accountRepository).save(account);
    }

    @Test
    void testGetAccountsByCustomer_Success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(accountRepository.findByCustomer(customer)).thenReturn(java.util.Collections.singletonList(account));

        var result = accountService.getAccountsByCustomer(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(customerRepository).findById(1L);
        verify(accountRepository).findByCustomer(customer);
    }

    @Test
    void testGetAccountsByCustomer_CustomerNotFound() {
        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            accountService.getAccountsByCustomer(999L);
        });
    }
}
