package com.marketplace.controller;

import com.marketplace.dto.LoginRequest;
import com.marketplace.model.User;
import com.marketplace.repository.UserRepository;
import com.marketplace.security.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        Optional<User> user =
                userRepository.findByEmail(request.getEmail());

        if(user.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Usuario no encontrado");
        }

        String dbPassword = user.get().getPassword();
        boolean matches = false;

        if (dbPassword != null && (dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2y$"))) {
            matches = passwordEncoder.matches(request.getPassword(), dbPassword);
        } else if (dbPassword != null && dbPassword.equals(request.getPassword())) {
            // Migración automática: si la contraseña estaba en texto plano en la BD, la encriptamos y guardamos al iniciar sesión
            user.get().setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user.get());
            matches = true;
        }

        if(!matches) {

            return ResponseEntity
                    .badRequest()
                    .body("Contraseña incorrecta");
        }

        String token =
                jwtService.generateToken(user.get().getEmail());

        Map<String, String> response = new HashMap<>();

        response.put("token", token);
        response.put("role", user.get().getRole() != null ? user.get().getRole() : "Usuario");
        response.put("nombre", user.get().getNombre() != null ? user.get().getNombre() : user.get().getEmail());
        response.put("userId", user.get().getId() != null ? String.valueOf(user.get().getId()) : "");
        response.put("email", user.get().getEmail() != null ? user.get().getEmail() : "");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email y contraseña son requeridos");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("El correo electrónico ya está registrado");
        }
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("Usuario");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        savedUser.setPassword("********"); // No devolver el hash en la respuesta REST
        return ResponseEntity.ok(savedUser);
    }
}