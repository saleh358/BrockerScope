using BrokerScope.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BrokerScope.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ConnectionDto> Connections => Set<ConnectionDto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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

        base.OnModelCreating(modelBuilder);
    }
}
