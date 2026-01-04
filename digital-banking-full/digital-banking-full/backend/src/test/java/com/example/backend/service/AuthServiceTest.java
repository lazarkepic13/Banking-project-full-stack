package com.example.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.Customer;
import com.example.backend.model.Employee;
import com.example.backend.model.Role;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.EmployeeRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private Customer customer;
    private Employee employee;
    private String testEmail = "test@example.com";
    private String testPassword = "password123";
    private String hashedPassword = "$2a$10$hashedPassword";

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(1L)
                .email(testEmail)
                .firstName("Test")
                .lastName("Customer")
                .password(hashedPassword)
                .build();

        employee = Employee.builder()
                .id(2L)
                .email("employee@example.com")
                .firstName("Test")
                .lastName("Employee")
                .password(hashedPassword)
                .role(Role.EMPLOYEE)
                .build();
    }

    @Test
    void testLogin_Customer_Success() {
        when(customerRepository.findByEmail(testEmail)).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches(testPassword, hashedPassword)).thenReturn(true);
        when(jwtService.generateToken(testEmail, "CUSTOMER", 1L)).thenReturn("test-token");

        Map<String, Object> result = authService.login(testEmail, testPassword);

        assertNotNull(result);
        assertEquals("test-token", result.get("token"));
        assertEquals("CUSTOMER", result.get("role"));
        assertEquals(customer, result.get("user"));
        verify(customerRepository).findByEmail(testEmail);
        verify(passwordEncoder).matches(testPassword, hashedPassword);
        verify(jwtService).generateToken(testEmail, "CUSTOMER", 1L);
    }

    @Test
    void testLogin_Employee_Success() {
        String employeeEmail = "employee@example.com";
        when(customerRepository.findByEmail(employeeEmail)).thenReturn(Optional.empty());
        when(employeeRepository.findByEmail(employeeEmail)).thenReturn(Optional.of(employee));
        when(passwordEncoder.matches(testPassword, hashedPassword)).thenReturn(true);
        when(jwtService.generateToken(employeeEmail, "EMPLOYEE", 2L)).thenReturn("test-token");

        Map<String, Object> result = authService.login(employeeEmail, testPassword);

        assertNotNull(result);
        assertEquals("test-token", result.get("token"));
        assertEquals("EMPLOYEE", result.get("role"));
        assertEquals(employee, result.get("user"));
        verify(employeeRepository).findByEmail(employeeEmail);
        verify(passwordEncoder).matches(testPassword, hashedPassword);
        verify(jwtService).generateToken(employeeEmail, "EMPLOYEE", 2L);
    }

    @Test
    void testLogin_InvalidPassword() {
        when(customerRepository.findByEmail(testEmail)).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches(testPassword, hashedPassword)).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> {
            authService.login(testEmail, testPassword);
        });

        verify(customerRepository).findByEmail(testEmail);
        verify(passwordEncoder).matches(testPassword, hashedPassword);
        verify(jwtService, never()).generateToken(any(), any(), any());
    }

    @Test
    void testLogin_UserNotFound() {
        when(customerRepository.findByEmail(testEmail)).thenReturn(Optional.empty());
        when(employeeRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> {
            authService.login(testEmail, testPassword);
        });

        verify(customerRepository).findByEmail(testEmail);
        verify(employeeRepository).findByEmail(testEmail);
        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtService, never()).generateToken(any(), any(), any());
    }

    @Test
    void testRegister_Success() {
        Customer newCustomer = Customer.builder()
                .email("new@example.com")
                .firstName("New")
                .lastName("User")
                .password(testPassword)
                .build();

        when(customerRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode(testPassword)).thenReturn(hashedPassword);
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Customer result = authService.register(newCustomer);

        assertNotNull(result);
        assertEquals(hashedPassword, result.getPassword());
        verify(customerRepository).existsByEmail("new@example.com");
        verify(passwordEncoder).encode(testPassword);
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        Customer newCustomer = Customer.builder()
                .email(testEmail)
                .firstName("New")
                .lastName("User")
                .password(testPassword)
                .build();

        when(customerRepository.existsByEmail(testEmail)).thenReturn(true);

        assertThrows(ConflictException.class, () -> {
            authService.register(newCustomer);
        });

        verify(customerRepository).existsByEmail(testEmail);
        verify(customerRepository, never()).save(any(Customer.class));
        verify(passwordEncoder, never()).encode(any());
    }
}

