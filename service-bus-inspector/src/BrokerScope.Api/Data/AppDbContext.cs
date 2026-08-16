using BrokerScope.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BrokerScope.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<ConnectionDto> Connections => Set<ConnectionDto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ConnectionDto>().HasKey(connection => connection.Id);
        modelBuilder
            .Entity<ConnectionDto>()
            .Property(connection => connection.Id)
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<ConnectionDto>().Property(connection => connection.Name).IsRequired();
        modelBuilder
            .Entity<ConnectionDto>()
            .Property(connection => connection.ConnectionString)
            .IsRequired();
        modelBuilder
            .Entity<ConnectionDto>()
            .HasOne<IdentityUser>()
            .WithMany()
            .HasForeignKey(connection => connection.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder
            .Entity<ConnectionDto>()
            .HasIndex(connection => new { connection.UserId, connection.Id });
    }
}
