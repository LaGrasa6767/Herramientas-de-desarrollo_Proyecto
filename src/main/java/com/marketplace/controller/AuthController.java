package com.marketplace.controller;

import com.marketplace.dto.LoginRequest;
import com.marketplace.model.User;
import com.marketplace.repository.UserRepository;
import com.marketplace.security.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

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

        if(!user.get().getPassword()
                .equals(request.getPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body("Contraseña incorrecta");
        }

        String token =
                jwtService.generateToken(user.get().getEmail());

        Map<String, String> response = new HashMap<>();

        response.put("token", token);

        return ResponseEntity.ok(response);
    }
}